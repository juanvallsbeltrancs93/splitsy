from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

from src.domain.common.entities import Entity
from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Amount, Description, Id


@dataclass(frozen=True)
class SettlementData:
    group_id: str
    from_participant_id: str
    to_participant_id: str
    amount: Decimal
    date: datetime
    id: str | None = None
    note: str | None = None


@dataclass()
class SettlementEntityData:
    id: Id
    group_id: Id
    from_participant_id: Id
    to_participant_id: Id
    amount: Amount
    date: datetime
    note: Description | None = None


class Settlement(Entity[SettlementEntityData]):
    def __init__(self, data: SettlementEntityData) -> None:
        super().__init__(id=data.id, data=data)
        self._group_id = data.group_id
        self._from_participant_id = data.from_participant_id
        self._to_participant_id = data.to_participant_id
        self._amount = data.amount
        self._date = data.date
        self._note = data.note

    @property
    def group_id(self) -> str:
        return self._group_id.value

    @property
    def from_participant_id(self) -> str:
        return self._from_participant_id.value

    @property
    def to_participant_id(self) -> str:
        return self._to_participant_id.value

    @property
    def amount(self) -> Decimal:
        return self._amount.value

    @property
    def date(self) -> datetime:
        return self._date

    @property
    def note(self) -> str | None:
        if self._note is None:
            return None
        return self._note.value

    def apply_to_balances(self, balances: dict[str, Decimal]) -> None:
        balances[self.from_participant_id] += self.amount
        balances[self.to_participant_id] -= self.amount

    @staticmethod
    def create(data: SettlementData) -> "Settlement":
        if data.from_participant_id == data.to_participant_id:
            raise ValidationError("A user cannot settle a debt with themselves")

        entity_data = SettlementEntityData(
            id=Id.create(data.id),
            group_id=Id.create(data.group_id),
            from_participant_id=Id.create(data.from_participant_id),
            to_participant_id=Id.create(data.to_participant_id),
            amount=Amount.create(data.amount),
            date=data.date,
            note=Description.create(data.note) if data.note is not None else None,
        )

        return Settlement(entity_data)
