import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.expenses.entities.expense import Expense, ExpenseData, SplitData
from src.infrastructure.expenses.relational_db.mapper import ExpenseMapper
from src.infrastructure.expenses.relational_db.relational_db_expenses_repository import (
    RelationalDBExpensesRepository,
)
from tests.mothers import ExpenseMother


@pytest.fixture
def repo(session: AsyncSession) -> RelationalDBExpensesRepository:
    return RelationalDBExpensesRepository(session, ExpenseMapper())


@pytest.fixture
def expense() -> Expense:
    return ExpenseMother.create()


class TestRelationalDBExpensesRepository:
    async def test_create_and_get_by_id(
        self, repo: RelationalDBExpensesRepository, expense: Expense
    ):
        await repo.create(expense)

        found = await repo.get_by_id(Id.create(expense.id))

        assert found is not None
        assert found.id == expense.id
        assert found.name == expense.name
        assert found.amount == expense.amount
        assert found.group_id == expense.group_id
        assert found.paid_by == expense.paid_by
        assert len(found.splits) == len(expense.splits)

    async def test_get_by_group_id(
        self, repo: RelationalDBExpensesRepository, expense: Expense
    ):
        group_id = expense.group_id
        second_expense = ExpenseMother.create(id=Id.create().value)
        await repo.create(expense)
        await repo.create(second_expense)

        results = await repo.get_by_group_id(Id.create(group_id))

        assert len(results) == 2

    async def test_get_by_group_id_returns_empty_list_when_none(
        self, repo: RelationalDBExpensesRepository
    ):
        results = await repo.get_by_group_id(Id.create())

        assert results == []

    async def test_get_by_id_returns_none_when_not_found(
        self, repo: RelationalDBExpensesRepository
    ):
        found = await repo.get_by_id(Id.create())

        assert found is None

    async def test_update(self, repo: RelationalDBExpensesRepository, expense: Expense):
        await repo.create(expense)

        updated_expense = Expense.create(
            ExpenseData(
                id=expense.id,
                name=expense.name,
                amount=expense.amount,
                date=expense.date,
                group_id=expense.group_id,
                paid_by=expense.paid_by,
                splits=[
                    SplitData(participant_id=s["participant_id"], amount=s["amount"])
                    for s in expense.splits
                ],
                description="Updated",
            )
        )
        await repo.update(updated_expense)

        found = await repo.get_by_id(Id.create(expense.id))
        assert found is not None
        assert found.description == "Updated"

    async def test_delete(self, repo: RelationalDBExpensesRepository, expense: Expense):
        await repo.create(expense)

        await repo.delete(Id.create(expense.id))

        found = await repo.get_by_id(Id.create(expense.id))
        assert found is None
