from dataclasses import dataclass
from uuid import uuid4

from src.domain.common.entities import Entity
from src.domain.common.value_objects import Id
from src.domain.groups.enumerations import ParticipantType
from src.domain.groups.value_objects import DisplayName


@dataclass(frozen=True)
class ParticipantData:
    display_name: str
    type: str
    user_id: str | None = None
    id: str | None = None
    is_active: bool = True


@dataclass()
class ParticipantEntityData:
    id: Id
    display_name: DisplayName
    type: ParticipantType
    user_id: Id | None
    is_active: bool


class Participant(Entity[ParticipantEntityData]):
    def __init__(self, data: ParticipantEntityData) -> None:
        super().__init__(id=data.id, data=data)
        self._display_name = data.display_name
        self._type = data.type
        self._user_id = data.user_id
        self._is_active = data.is_active

    @property
    def display_name(self) -> str:
        return self._display_name.value

    @property
    def type(self) -> ParticipantType:
        return self._type

    @property
    def user_id(self) -> str | None:
        if self._user_id is None:
            return None
        return self._user_id.value

    @property
    def is_active(self) -> bool:
        return self._is_active

    def deactivate(self) -> None:
        self._is_active = False

    def is_registered(self) -> bool:
        return self._type == ParticipantType.REGISTERED

    @staticmethod
    def create(data: ParticipantData) -> "Participant":
        return Participant(
            ParticipantEntityData(
                id=Id.create(data.id if data.id else str(uuid4())),
                display_name=DisplayName.create(data.display_name),
                type=ParticipantType(data.type.upper()),
                user_id=Id.create(data.user_id) if data.user_id else None,
                is_active=data.is_active,
            )
        )

    @staticmethod
    def create_registered(user_id: str, display_name: str) -> "Participant":
        return Participant.create(
            ParticipantData(
                display_name=display_name,
                type=ParticipantType.REGISTERED.value,
                user_id=user_id,
            )
        )

    @staticmethod
    def create_non_registered(display_name: str) -> "Participant":
        return Participant.create(
            ParticipantData(
                display_name=display_name,
                type=ParticipantType.NON_REGISTERED.value,
            )
        )

    def claim(self, user_id: str) -> None:
        self._type = ParticipantType.REGISTERED
        self._user_id = Id.create(user_id)
