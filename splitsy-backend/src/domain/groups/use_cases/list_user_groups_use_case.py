from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.repositories import GroupsRepository


class ListUserGroupsUseCase:
    def __init__(self, groups_repository: GroupsRepository) -> None:
        self._groups_repository = groups_repository

    async def __call__(self, user_id: str) -> list[Group]:
        return await self._groups_repository.list_by_participant(Id.create(user_id))
