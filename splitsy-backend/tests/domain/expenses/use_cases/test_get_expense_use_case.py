from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.expenses.entities import Expense
from src.domain.expenses.errors import ExpenseNotFoundError
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.expenses.use_cases import GetExpenseUseCase
from tests.mothers import ExpenseMother


@pytest.fixture
def repository() -> AsyncMock:
    return create_autospec(ExpensesRepository, instance=True)


@pytest.fixture
def expense() -> Expense:
    return ExpenseMother.create()


class TestGetExpenseUseCase:
    async def test_should_return_expense_when_found(
        self, repository: AsyncMock, expense: Expense
    ):
        repository.get_by_id.return_value = expense

        use_case = GetExpenseUseCase(repository)
        result = await use_case(expense.id)

        repository.get_by_id.assert_awaited_once_with(Id.create(expense.id))
        assert result is expense

    async def test_should_raise_when_expense_not_found(self, repository: AsyncMock):
        repository.get_by_id.return_value = None
        missing_id = Id.create().value

        use_case = GetExpenseUseCase(repository)

        with pytest.raises(ExpenseNotFoundError, match=missing_id):
            await use_case(missing_id)
