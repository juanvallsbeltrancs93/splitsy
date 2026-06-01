from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from src.domain.users.errors import UserNotFoundError
from src.domain.users.repositories import UsersRepository


class RemoveUserFromGroup:
    def __init__(
        self, groups_repository: GroupsRepository, users_repository: UsersRepository
    ) -> None:
        self._groups_repository: GroupsRepository = groups_repository
        self._users_repository: UsersRepository = users_repository

    async def __call__(self, group_id: str, user_id: str) -> Group:
        group_id_vo, user_id_vo = Id.create(group_id), Id.create(user_id)

        user = await self._users_repository.get_by_id(user_id_vo)
        if user is None:
            raise UserNotFoundError(f"User with id {user_id} not found.")

        group = await self._groups_repository.get_by_id(group_id_vo)
        if group is None:
            raise GroupNotFoundError(f"Group with id {group_id} not found.")

        group.remove_participant(user_id_vo)

        await self._groups_repository.update(group)

        return group
