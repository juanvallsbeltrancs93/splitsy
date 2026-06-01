from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.expenses.entities import Expense
from src.domain.expenses.repositories.expenses_repository import ExpensesRepository
from src.infrastructure.expenses.relational_db.mapper import ExpenseMapper
from src.infrastructure.expenses.relational_db.orm import ExpenseORM


class RelationalDBExpensesRepository(ExpensesRepository):
    def __init__(self, session: AsyncSession, mapper: ExpenseMapper) -> None:
        self._session = session
        self._mapper = mapper

    async def get_by_id(self, id: Id) -> Expense | None:
        stmt = select(ExpenseORM).where(ExpenseORM.id == id.value)
        result = await self._session.execute(stmt)
        orm = result.scalars().first()
        return self._mapper.to_entity(orm) if orm else None

    async def get_by_group_id(self, group_id: Id) -> list[Expense]:
        stmt = select(ExpenseORM).where(ExpenseORM.group_id == group_id.value)
        result = await self._session.execute(stmt)
        orms = result.scalars().all()
        return [self._mapper.to_entity(orm) for orm in orms]

    async def create(self, expense: Expense) -> None:
        orm = self._mapper.to_orm(expense)
        self._session.add(orm)
        await self._session.commit()

    async def update(self, expense: Expense) -> None:
        stmt = select(ExpenseORM).where(ExpenseORM.id == expense.id)
        result = await self._session.execute(stmt)
        existing = result.scalars().first()
        if existing:
            updated = self._mapper.to_orm(expense)
            existing.name = updated.name
            existing.amount = updated.amount
            existing.date = updated.date
            existing.group_id = updated.group_id
            existing.paid_by = updated.paid_by
            existing.description = updated.description
            existing.splits = self._mapper.to_splits(expense)
            await self._session.commit()

    async def delete(self, id: Id) -> None:
        stmt = delete(ExpenseORM).where(ExpenseORM.id == id.value)
        await self._session.execute(stmt)
        await self._session.commit()

    async def delete_by_group_id(self, group_id: Id) -> None:
        stmt = delete(ExpenseORM).where(ExpenseORM.group_id == group_id.value)
        await self._session.execute(stmt)
        await self._session.commit()
