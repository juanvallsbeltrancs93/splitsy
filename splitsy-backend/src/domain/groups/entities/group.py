from dataclasses import dataclass, field

from src.domain.common.entities import Entity
from src.domain.common.value_objects import Currency, Id, Name
from src.domain.groups.entities.participant import Participant, ParticipantData
from src.domain.groups.errors import (
    LastParticipantCannotLeaveError,
    NotGroupOwnerError,
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
    owner_id: str | None = None


@dataclass()
class GroupEntityData:
    id: Id
    name: Name
    currency: Currency
    participants: list[Participant]
    owner_id: Id


class Group(Entity[GroupEntityData]):
    def __init__(self, data: GroupEntityData) -> None:
        super().__init__(id=data.id, data=data)
        self._name = data.name
        self._currency = data.currency
        self._participants = data.participants
        self._owner_id = data.owner_id

    @property
    def name(self) -> str:
        return self._name.value

    @property
    def currency(self) -> str:
        return self._currency.value

    @property
    def owner_id(self) -> str:
        return self._owner_id.value

    @property
    def participants(self) -> list[Participant]:
        return list(self._participants)

    @property
    def active_participants(self) -> list[Participant]:
        return [p for p in self._participants if p.is_active]

    def _find_active_participant(self, participant_id: Id) -> Participant | None:
        return next(
            (
                p
                for p in self._participants
                if p.id == participant_id.value and p.is_active
            ),
            None,
        )

    def find_active_participant_by_user_id(self, user_id: str) -> Participant | None:
        return next(
            (
                p
                for p in self._participants
                if p.is_registered() and p.user_id == user_id and p.is_active
            ),
            None,
        )

    def is_owner(self, user_id: str) -> bool:
        participant = self.find_active_participant_by_user_id(user_id)
        return participant is not None and participant.id == self.owner_id

    @staticmethod
    def create(data: GroupData) -> "Group":
        entity_data = GroupEntityData(
            id=Id.create(data.id),
            name=Name.create(data.name),
            currency=Currency.create(data.currency),
            participants=[Participant.create(p) for p in data.participants],
            owner_id=Id.create(data.owner_id),
        )

        return Group(entity_data)

    def update_name(self, name: str) -> None:
        self._name = Name.create(name)

    def exist_participant(self, participant_id: Id) -> bool:
        return any(p.id == participant_id.value for p in self._participants)

    def add_participant(self, participant: Participant) -> None:
        if any(
            p.display_name.lower() == participant.display_name.lower()
            for p in self.active_participants
        ):
            raise ParticipantNameAlreadyInGroupError(
                f"Participant with display name '{participant.display_name}' already in group."
            )
        if participant.is_registered() and participant.user_id is not None:
            if any(
                p.is_registered() and p.user_id == participant.user_id
                for p in self.active_participants
            ):
                raise ParticipantAlreadyInGroupError(
                    f"Participant with user_id {participant.user_id} already in group."
                )
        self._participants.append(participant)

    def _deactivate_participant(self, participant_id: Id) -> None:
        """Internal use only — deactivates a participant without auth checks."""
        target = self._find_active_participant(participant_id)
        if target is None:
            raise ParticipantNotFoundInGroupError(
                f"Participant {participant_id.value} not found in group."
            )
        target.deactivate()

    def remove_participant(self, participant_id: Id, requester_id: str) -> None:
        target = self._find_active_participant(participant_id)
        if target is None:
            raise ParticipantNotFoundInGroupError(
                f"Participant {participant_id.value} not found in group."
            )

        requester_participant = self.find_active_participant_by_user_id(requester_id)
        if requester_participant is None:
            raise NotGroupOwnerError("User is not a participant in this group.")

        # Check if requester is removing SOMEONE ELSE
        if requester_participant.id != target.id:
            # Only owner can remove others
            if requester_participant.id != self.owner_id:
                raise NotGroupOwnerError(
                    "Only the group owner can remove other participants."
                )

        # If requester is the owner removing themselves, transfer ownership first
        if requester_participant.id == target.id and target.id == self.owner_id:
            if len(self.active_participants) == 1:
                raise LastParticipantCannotLeaveError(
                    "Cannot leave group as the last active participant."
                )
            next_participant = next(
                p for p in self.active_participants if p.id != target.id
            )
            self._owner_id = Id.create(next_participant.id)

        target.deactivate()

    def claim_participant(self, participant_id: Id, user_id: str) -> None:
        target = self._find_active_participant(participant_id)
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
