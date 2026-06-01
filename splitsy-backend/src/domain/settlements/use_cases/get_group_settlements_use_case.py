from src.domain.common.value_objects import Id
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from src.domain.settlements.entities import Settlement
from src.domain.settlements.repositories import SettlementsRepository


class GetGroupSettlementsUseCase:
    def __init__(
        self,
        settlements_repository: SettlementsRepository,
        groups_repository: GroupsRepository,
    ) -> None:
        self._settlements_repository = settlements_repository
        self._groups_repository = groups_repository

    async def __call__(self, group_id: str) -> list[Settlement]:
        group = await self._groups_repository.get_by_id(Id.create(group_id))
        if group is None:
            raise GroupNotFoundError(f"Group with id {group_id} not found.")

        return await self._settlements_repository.get_by_group_id(Id.create(group_id))
