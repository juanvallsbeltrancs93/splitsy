from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository


class ClaimParticipantUseCase:
    def __init__(self, groups_repository: GroupsRepository) -> None:
        self._groups_repository = groups_repository

    async def __call__(self, group_id: str, participant_id: str, user_id: str) -> Group:
        group = await self._groups_repository.get_by_id(Id.create(group_id))
        if group is None:
            raise GroupNotFoundError(f"Group with id {group_id} not found.")

        group.claim_participant(Id.create(participant_id), user_id)

        await self._groups_repository.update(group)

        return group
