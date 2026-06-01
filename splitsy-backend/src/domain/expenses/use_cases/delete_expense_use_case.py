from src.domain.common.value_objects import Id
from src.domain.expenses.errors import ExpenseNotFoundError
from src.domain.expenses.repositories import ExpensesRepository


class DeleteExpenseUseCase:
    def __init__(self, expenses_repository: ExpensesRepository) -> None:
        self._expenses_repository = expenses_repository

    async def __call__(self, expense_id: str) -> None:
        expense = await self._expenses_repository.get_by_id(Id.create(expense_id))

        if expense is None:
            raise ExpenseNotFoundError(f"Expense with id {expense_id} not found.")

        await self._expenses_repository.delete(Id.create(expense_id))
