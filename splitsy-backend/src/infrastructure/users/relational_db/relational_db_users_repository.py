from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.users.entities import User
from src.domain.users.repositories.user_repository import UsersRepository
from src.domain.users.value_objects import Email
from src.infrastructure.users.relational_db.mapper import UserMapper
from src.infrastructure.users.relational_db.orm import UserORM


class RelationalDBUsersRepository(UsersRepository):
    def __init__(self, session: AsyncSession, mapper: UserMapper) -> None:
        self._session = session
        self._mapper = mapper

    async def get_by_id(self, id: Id) -> User | None:
        stmt = select(UserORM).where(UserORM.id == id.value)
        result = await self._session.execute(stmt)
        orm = result.scalars().first()
        return self._mapper.to_entity(orm) if orm else None

    async def get_by_email(self, email: Email) -> User | None:
        stmt = select(UserORM).where(UserORM.email == email.value)
        result = await self._session.execute(stmt)
        orm = result.scalars().first()
        return self._mapper.to_entity(orm) if orm else None

    async def create(self, user: User) -> None:
        orm = self._mapper.to_orm(user)
        self._session.add(orm)
        await self._session.commit()

    async def update(self, user: User) -> None:
        stmt = select(UserORM).where(UserORM.id == user.id)
        result = await self._session.execute(stmt)
        existing = result.scalars().first()
        if existing:
            updated = self._mapper.to_orm(user)
            existing.name = updated.name
            existing.email = updated.email
            existing.password = updated.password
            await self._session.commit()

    async def delete(self, id: Id) -> None:
        stmt = delete(UserORM).where(UserORM.id == id.value)
        await self._session.execute(stmt)
        await self._session.commit()
