from src.domain.common.value_objects import Id
from src.domain.expenses.entities import Expense, ExpenseData
from src.domain.expenses.errors import ExpenseNotFoundError, InvalidParticipantError
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository


class UpdateExpenseUseCase:
    def __init__(
        self,
        expenses_repository: ExpensesRepository,
        groups_repository: GroupsRepository,
    ) -> None:
        self._expenses_repository = expenses_repository
        self._groups_repository = groups_repository

    async def __call__(self, expense_id: str, expense_data: ExpenseData) -> Expense:
        existing = await self._expenses_repository.get_by_id(Id.create(expense_id))

        if existing is None:
            raise ExpenseNotFoundError(f"Expense with id {expense_id} not found.")

        group = await self._groups_repository.get_by_id(Id.create(existing.group_id))
        if group is None:
            raise GroupNotFoundError(
                f"Group with id {existing.group_id} not found."
            )

        valid_participant_ids = {p.id for p in group.participants}

        if expense_data.paid_by not in valid_participant_ids:
            raise InvalidParticipantError(
                f"Participant {expense_data.paid_by} does not belong to group {existing.group_id}."
            )

        for split in expense_data.splits:
            if split.participant_id not in valid_participant_ids:
                raise InvalidParticipantError(
                    f"Participant {split.participant_id} does not belong to group {existing.group_id}."
                )

        updated_expense = Expense.create(
            ExpenseData(
                id=expense_id,
                name=expense_data.name,
                amount=expense_data.amount,
                date=expense_data.date,
                group_id=existing.group_id,
                paid_by=expense_data.paid_by,
                splits=expense_data.splits,
                description=expense_data.description,
            )
        )

        await self._expenses_repository.update(updated_expense)

        return updated_expense
