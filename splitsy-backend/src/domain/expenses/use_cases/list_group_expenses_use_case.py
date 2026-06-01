from src.domain.common.value_objects import Id
from src.domain.expenses.entities import Expense
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository


class ListGroupExpensesUseCase:
    def __init__(
        self,
        expenses_repository: ExpensesRepository,
        groups_repository: GroupsRepository,
    ) -> None:
        self._expenses_repository = expenses_repository
        self._groups_repository = groups_repository

    async def __call__(self, group_id: str) -> list[Expense]:
        group = await self._groups_repository.get_by_id(Id.create(group_id))
        if group is None:
            raise GroupNotFoundError(f"Group with id {group_id} not found.")

        return await self._expenses_repository.get_by_group_id(Id.create(group_id))
