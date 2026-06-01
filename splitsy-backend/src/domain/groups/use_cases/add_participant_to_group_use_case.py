from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.entities.participant import Participant
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from src.domain.users.errors import UserNotFoundError
from src.domain.users.repositories import UsersRepository


class AddParticipantToGroupUseCase:
    def __init__(
        self,
        groups_repository: GroupsRepository,
        users_repository: UsersRepository,
    ) -> None:
        self._groups_repository = groups_repository
        self._users_repository = users_repository

    async def __call__(
        self,
        group_id: str,
        participant_type: str,
        user_id: str | None = None,
        display_name: str | None = None,
    ) -> Group:
        if participant_type.upper() == "REGISTERED":
            user = await self._users_repository.get_by_id(Id.create(user_id))
            if user is None:
                raise UserNotFoundError(f"User with id {user_id} not found.")
            participant = Participant.create_registered(
                user_id=user.id,
                display_name=user.name,
            )
        else:
            participant = Participant.create_non_registered(display_name=display_name)

        group = await self._groups_repository.get_by_id(Id.create(group_id))
        if group is None:
            raise GroupNotFoundError(f"Group with id {group_id} not found.")

        group.add_participant(participant)

        await self._groups_repository.update(group)

        return group
