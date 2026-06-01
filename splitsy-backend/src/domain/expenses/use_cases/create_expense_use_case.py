from src.domain.expenses.entities import Expense, ExpenseData
from src.domain.expenses.errors import InvalidParticipantError
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository


class CreateExpenseUseCase:
    def __init__(
        self,
        expenses_repository: ExpensesRepository,
        groups_repository: GroupsRepository,
    ) -> None:
        self._expenses_repository = expenses_repository
        self._groups_repository = groups_repository

    async def __call__(self, expense_data: ExpenseData) -> Expense:
        from src.domain.common.value_objects import Id

        group = await self._groups_repository.get_by_id(
            Id.create(expense_data.group_id)
        )
        if group is None:
            raise GroupNotFoundError(
                f"Group with id {expense_data.group_id} not found."
            )

        valid_participant_ids = {p.id for p in group.participants}

        if expense_data.paid_by not in valid_participant_ids:
            raise InvalidParticipantError(
                f"Participant {expense_data.paid_by} does not belong to group {expense_data.group_id}."
            )

        for split in expense_data.splits:
            if split.participant_id not in valid_participant_ids:
                raise InvalidParticipantError(
                    f"Participant {split.participant_id} does not belong to group {expense_data.group_id}."
                )

        expense = Expense.create(expense_data)

        await self._expenses_repository.create(expense)

        return expense
