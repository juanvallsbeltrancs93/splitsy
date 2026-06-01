from src.domain.common.value_objects import Id
from src.domain.groups.errors import GroupNotFoundError, ParticipantNotFoundInGroupError
from src.domain.groups.repositories import GroupsRepository
from src.domain.settlements.entities import Settlement, SettlementData
from src.domain.settlements.repositories import SettlementsRepository


class CreateSettlementUseCase:
    def __init__(
        self,
        settlements_repository: SettlementsRepository,
        groups_repository: GroupsRepository,
    ) -> None:
        self._settlements_repository = settlements_repository
        self._groups_repository = groups_repository

    async def __call__(self, settlement_data: SettlementData) -> Settlement:
        group = await self._groups_repository.get_by_id(
            Id.create(settlement_data.group_id)
        )
        if group is None:
            raise GroupNotFoundError(
                f"Group with id {settlement_data.group_id} not found."
            )

        participant_ids = {p.id for p in group.participants}

        if settlement_data.from_participant_id not in participant_ids:
            raise ParticipantNotFoundInGroupError(
                f"Participant {settlement_data.from_participant_id} is not in group {settlement_data.group_id}."
            )

        if settlement_data.to_participant_id not in participant_ids:
            raise ParticipantNotFoundInGroupError(
                f"Participant {settlement_data.to_participant_id} is not in group {settlement_data.group_id}."
            )

        settlement = Settlement.create(settlement_data)

        await self._settlements_repository.create(settlement)

        return settlement
