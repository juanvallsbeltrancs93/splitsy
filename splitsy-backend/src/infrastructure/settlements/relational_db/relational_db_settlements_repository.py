from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.settlements.entities import Settlement
from src.domain.settlements.repositories.settlements_repository import (
    SettlementsRepository,
)
from src.infrastructure.settlements.relational_db.mapper import SettlementMapper
from src.infrastructure.settlements.relational_db.orm import SettlementORM


class RelationalDBSettlementsRepository(SettlementsRepository):
    def __init__(self, session: AsyncSession, mapper: SettlementMapper) -> None:
        self._session = session
        self._mapper = mapper

    async def get_by_id(self, id: Id) -> Settlement | None:
        stmt = select(SettlementORM).where(SettlementORM.id == id.value)
        result = await self._session.execute(stmt)
        orm = result.scalars().first()
        return self._mapper.to_entity(orm) if orm else None

    async def get_by_group_id(self, group_id: Id) -> list[Settlement]:
        stmt = select(SettlementORM).where(SettlementORM.group_id == group_id.value)
        result = await self._session.execute(stmt)
        orms = result.scalars().all()
        return [self._mapper.to_entity(orm) for orm in orms]

    async def create(self, settlement: Settlement) -> None:
        orm = self._mapper.to_orm(settlement)
        self._session.add(orm)
        await self._session.commit()

    async def delete(self, id: Id) -> None:
        stmt = delete(SettlementORM).where(SettlementORM.id == id.value)
        await self._session.execute(stmt)
        await self._session.commit()

    async def delete_by_group_id(self, group_id: Id) -> None:
        stmt = delete(SettlementORM).where(SettlementORM.group_id == group_id.value)
        await self._session.execute(stmt)
        await self._session.commit()
