from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.repositories.groups_repository import GroupsRepository
from src.infrastructure.groups.relational_db.mapper import GroupMapper
from src.infrastructure.groups.relational_db.orm import GroupORM, GroupParticipantORM


class RelationalDBGroupsRepository(GroupsRepository):
    def __init__(self, session: AsyncSession, mapper: GroupMapper) -> None:
        self._session = session
        self._mapper = mapper

    async def get_by_id(self, id: Id) -> Group | None:
        stmt = select(GroupORM).where(GroupORM.id == id.value)
        result = await self._session.execute(stmt)
        orm = result.scalars().first()
        return self._mapper.to_entity(orm) if orm else None

    async def create(self, group: Group) -> None:
        orm = self._mapper.to_orm(group)
        self._session.add(orm)
        await self._session.commit()

    async def update(self, group: Group) -> None:
        stmt = select(GroupORM).where(GroupORM.id == group.id)
        result = await self._session.execute(stmt)
        existing = result.scalars().first()
        if existing:
            existing.name = group.name
            existing.participants = self._mapper.to_participants(group)
            await self._session.commit()

    async def delete(self, id: Id) -> None:
        stmt = delete(GroupORM).where(GroupORM.id == id.value)
        await self._session.execute(stmt)
        await self._session.commit()

    async def list_by_participant(self, user_id: Id) -> list[Group]:
        result = await self._session.execute(
            select(GroupORM)
            .join(GroupParticipantORM, GroupORM.id == GroupParticipantORM.group_id)
            .where(GroupParticipantORM.user_id == user_id.value)
        )
        return [self._mapper.to_entity(orm) for orm in result.scalars().all()]
