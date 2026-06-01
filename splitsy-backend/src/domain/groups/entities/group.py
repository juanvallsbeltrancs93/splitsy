from dataclasses import dataclass, field

from src.domain.common.entities import Entity
from src.domain.common.value_objects import Currency, Id, Name
from src.domain.groups.entities.participant import Participant, ParticipantData
from src.domain.groups.errors import (
    ParticipantAlreadyClaimedError,
    ParticipantAlreadyInGroupError,
    ParticipantNameAlreadyInGroupError,
    ParticipantNotAliasError,
    ParticipantNotFoundInGroupError,
)


@dataclass(frozen=True)
class GroupData:
    name: str
    currency: str
    participants: list[ParticipantData] = field(default_factory=list)
    id: str | None = None


@dataclass()
class GroupEntityData:
    id: Id
    name: Name
    currency: Currency
    participants: list[Participant]


class Group(Entity[GroupEntityData]):
    def __init__(self, data: GroupEntityData) -> None:
        super().__init__(id=data.id, data=data)
        self._name = data.name
        self._currency = data.currency
        self._participants = data.participants

    @property
    def name(self) -> str:
        return self._name.value

    @property
    def currency(self) -> str:
        return self._currency.value

    @property
    def participants(self) -> list[Participant]:
        return list(self._participants)

    @staticmethod
    def create(data: GroupData) -> "Group":
        entity_data = GroupEntityData(
            id=Id.create(data.id),
            name=Name.create(data.name),
            currency=Currency.create(data.currency),
            participants=[Participant.create(p) for p in data.participants],
        )

        return Group(entity_data)

    def exist_participant(self, participant_id: Id) -> bool:
        return any(p.id == participant_id.value for p in self._participants)

    def add_participant(self, participant: Participant) -> None:
        if any(
            p.display_name.lower() == participant.display_name.lower()
            for p in self._participants
        ):
            raise ParticipantNameAlreadyInGroupError(
                f"Participant with display name '{participant.display_name}' already in group."
            )
        if participant.is_registered() and participant.user_id is not None:
            if any(
                p.is_registered() and p.user_id == participant.user_id
                for p in self._participants
            ):
                raise ParticipantAlreadyInGroupError(
                    f"Participant with user_id {participant.user_id} already in group."
                )
        self._participants.append(participant)

    def remove_participant(self, participant_id: Id) -> None:
        if not self.exist_participant(participant_id):
            raise ParticipantNotFoundInGroupError(
                f"Participant {participant_id.value} not found in group."
            )
        self._participants = [
            p for p in self._participants if p.id != participant_id.value
        ]

    def claim_participant(self, participant_id: Id, user_id: str) -> None:
        target = next(
            (p for p in self._participants if p.id == participant_id.value), None
        )
        if target is None:
            raise ParticipantNotFoundInGroupError(
                f"Participant {participant_id.value} not found in group."
            )
        if target.is_registered():
            raise ParticipantNotAliasError(
                f"Participant {participant_id.value} is already REGISTERED."
            )
        if any(p.is_registered() and p.user_id == user_id for p in self._participants):
            raise ParticipantAlreadyClaimedError(
                f"User {user_id} is already a REGISTERED participant in this group."
            )
        target.claim(user_id)
