from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.repositories.groups_repository import GroupsRepository
from src.infrastructure.groups.relational_db.mapper import GroupMapper
from src.infrastructure.groups.relational_db.orm import GroupORM, GroupParticipantORM


class RelationalDBGroupsRepository(GroupsRepository):
    """SQLAlchemy-based repository for Group aggregate persistence.

    Participant merge strategy
    --------------------------
    The Group aggregate contains a collection of participants. When updating a group,
    we must reconcile the entity's participant list with the ORM's tracked collection.
    Rather than replacing the collection (which triggers SQLAlchemy's cascade behavior
    and can cause unintended DELETE/INSERT cycles), we merge participants explicitly:

    1. Load the existing GroupORM from the session
    2. Update scalar fields (name, owner_id) directly
    3. For each participant in the entity:
       - If it already exists in the ORM collection → update in-place
       - If it's new → append to the collection
    4. Commit

    This produces clean UPDATE statements only for changed rows, avoids identity-map
    conflicts, and keeps the implementation explicit and predictable.
    """

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
        """Persist changes to an existing group by merging entity state into the tracked ORM."""
        existing = await self._session.get(GroupORM, group.id)
        if existing is None:
            return

        # Update scalar fields
        existing.name = group.name
        existing.owner_id = group.owner_id

        # Merge participants explicitly
        self._merge_participants(existing, group)

        await self._session.commit()

    def _merge_participants(self, existing: GroupORM, group: Group) -> None:
        """Reconcile the entity's participant list with the ORM's tracked collection.

        Existing participants are updated in-place. New participants are appended.
        This avoids SQLAlchemy cascade side-effects and produces minimal SQL.
        """
        existing_by_id = {p.id: p for p in existing.participants}

        for participant_data in self._mapper.to_participants(group):
            orm_participant = existing_by_id.get(participant_data.id)
            if orm_participant is not None:
                # Update mutable attributes on the tracked ORM object
                orm_participant.is_active = participant_data.is_active
                orm_participant.display_name = participant_data.display_name
                orm_participant.type = participant_data.type
                orm_participant.user_id = participant_data.user_id
            else:
                # New participant not yet in DB — append to the tracked collection
                existing.participants.append(participant_data)

    async def delete(self, id: Id) -> None:
        stmt = delete(GroupORM).where(GroupORM.id == id.value)
        await self._session.execute(stmt)
        await self._session.commit()

    async def list_by_participant(self, user_id: Id) -> list[Group]:
        result = await self._session.execute(
            select(GroupORM)
            .join(GroupParticipantORM, GroupORM.id == GroupParticipantORM.group_id)
            .where(
                GroupParticipantORM.user_id == user_id.value,
                GroupParticipantORM.is_active == True,  # noqa: E712
            )
        )
        return [self._mapper.to_entity(orm) for orm in result.scalars().all()]
