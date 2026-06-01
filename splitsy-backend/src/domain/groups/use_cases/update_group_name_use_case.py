from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group, GroupData
from src.domain.groups.entities.participant import ParticipantData
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository


class UpdateGroupNameUseCase:
    def __init__(self, groups_repository: GroupsRepository) -> None:
        self._groups_repository = groups_repository

    async def __call__(self, group_id: Id, name: str) -> Group:
        existing = await self._groups_repository.get_by_id(group_id)

        if existing is None:
            raise GroupNotFoundError(f"Group with id {group_id.value} not found.")

        updated = Group.create(
            GroupData(
                id=group_id.value,
                name=name,
                currency=existing.currency,
                participants=[
                    ParticipantData(
                        id=p.id,
                        display_name=p.display_name,
                        type=p.type.value,
                        user_id=p.user_id,
                    )
                    for p in existing.participants
                ],
            )
        )
        await self._groups_repository.update(updated)
        return updated
