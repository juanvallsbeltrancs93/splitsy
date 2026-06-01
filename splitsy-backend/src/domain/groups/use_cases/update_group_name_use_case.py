from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository


class UpdateGroupNameUseCase:
    def __init__(self, groups_repository: GroupsRepository) -> None:
        self._groups_repository = groups_repository

    async def __call__(self, group_id: Id, name: str) -> Group:
        existing = await self._groups_repository.get_by_id(group_id)

        if existing is None:
            raise GroupNotFoundError(f"Group with id {group_id.value} not found.")

        existing.update_name(name)
        await self._groups_repository.update(existing)
        return existing
