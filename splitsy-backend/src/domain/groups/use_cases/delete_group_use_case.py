from src.domain.common.value_objects import Id
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.errors.groups_errors import NotGroupOwnerError
from src.domain.groups.repositories import GroupsRepository
from src.domain.settlements.repositories import SettlementsRepository


class DeleteGroupUseCase:
    def __init__(
        self,
        groups_repository: GroupsRepository,
        expenses_repository: ExpensesRepository,
        settlements_repository: SettlementsRepository,
    ) -> None:
        self._groups_repository = groups_repository
        self._expenses_repository = expenses_repository
        self._settlements_repository = settlements_repository

    async def __call__(self, group_id: Id, requester_id: str) -> None:
        existing = await self._groups_repository.get_by_id(group_id)
        if existing is None:
            raise GroupNotFoundError(f"Group with id {group_id.value} not found.")
        if not existing.is_owner(requester_id):
            raise NotGroupOwnerError(
                f"User {requester_id} is not the owner of group {group_id.value}."
            )
        await self._expenses_repository.delete_by_group_id(group_id)
        await self._settlements_repository.delete_by_group_id(group_id)
        await self._groups_repository.delete(group_id)
