from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group, GroupData
from src.domain.groups.entities.participant import Participant, ParticipantData
from src.domain.groups.repositories import GroupsRepository
from src.domain.users.errors import UserNotFoundError
from src.domain.users.repositories import UsersRepository


class CreateGroupUseCase:
    _DEFAULT_CURRENCY = "USD"

    def __init__(
        self,
        groups_repository: GroupsRepository,
        users_repository: UsersRepository,
    ) -> None:
        self._groups_repository = groups_repository
        self._users_repository = users_repository

    async def __call__(
        self,
        name: str,
        creator_id: str,
        aliases: list[str] = [],
        currency: str = _DEFAULT_CURRENCY,
    ) -> Group:
        user = await self._users_repository.get_by_id(Id.create(creator_id))

        if not user:
            raise UserNotFoundError(f"User with id {creator_id} not found.")

        participant = Participant.create_registered(
            user_id=creator_id,
            display_name=user.name,
        )

        alias_participants = [
            Participant.create_non_registered(display_name=alias) for alias in aliases
        ]

        all_participants = [participant] + alias_participants

        group_data = GroupData(
            name=name,
            currency=currency,
            participants=[
                ParticipantData(
                    id=p.id,
                    display_name=p.display_name,
                    type=p.type.value,
                    user_id=p.user_id,
                )
                for p in all_participants
            ],
        )

        group = Group.create(group_data)

        await self._groups_repository.create(group)

        created_group = await self._groups_repository.get_by_id(Id.create(group.id))
        if created_group is None:
            raise RuntimeError("Group creation failed: created group was not found")

        return created_group
