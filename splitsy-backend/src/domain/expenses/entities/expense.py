from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

from src.domain.common.entities import Entity
from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Amount, Description, Id
from src.domain.expenses.value_objects import Name, Split


@dataclass(frozen=True)
class SplitData:
    participant_id: str
    amount: Decimal


@dataclass(frozen=True)
class ExpenseData:
    name: str
    amount: Decimal
    date: datetime
    group_id: str
    paid_by: str
    splits: list[SplitData]
    description: str | None = None
    id: str | None = None


@dataclass()
class ExpenseEntityData:
    id: Id
    name: Name
    amount: Amount
    date: datetime
    group_id: Id
    paid_by: Id
    splits: list[Split]
    description: Description | None = None


class Expense(Entity[ExpenseEntityData]):
    def __init__(self, data: ExpenseEntityData) -> None:
        super().__init__(id=data.id, data=data)
        self._name = data.name
        self._amount = data.amount
        self._date = data.date
        self._description = data.description
        self._group_id = data.group_id
        self._paid_by = data.paid_by
        self._splits = data.splits

    @property
    def name(self) -> str:
        return self._name.value

    @property
    def amount(self) -> Decimal:
        return self._amount.value

    @property
    def date(self) -> datetime:
        return self._date

    @property
    def description(self) -> str | None:
        if self._description is None:
            return None

        return self._description.value

    @property
    def group_id(self) -> str:
        return self._group_id.value

    @property
    def paid_by(self) -> str:
        return self._paid_by.value

    @property
    def splits(self) -> list[dict[str, Decimal | str]]:
        return [
            {"participant_id": split.participant_id.value, "amount": split.amount.value}
            for split in self._splits
        ]

    def to_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "amount": self.amount,
            "date": self.date,
            "description": self.description,
            "group_id": self.group_id,
            "paid_by": self.paid_by,
            "splits": self.splits,
        }

    def apply_to_balances(self, balances: dict[str, Decimal]) -> None:
        balances[self.paid_by] += self.amount
        for split in self._splits:
            balances[split.participant_id.value] -= split.amount.value

    @staticmethod
    def create(data: ExpenseData) -> "Expense":
        if not isinstance(data.splits, list) or len(data.splits) == 0:
            raise ValidationError("Expense must have at least one split")

        TOLERANCE = Decimal("0.02")
        splits_total = sum(split.amount for split in data.splits)
        if abs(splits_total - data.amount) > TOLERANCE:
            raise ValidationError(
                f"Splits total ({splits_total}) must equal expense amount ({data.amount})"
            )

        entity_data = ExpenseEntityData(
            id=Id.create(data.id),
            name=Name.create(data.name),
            amount=Amount.create(data.amount),
            date=data.date,
            description=(
                Description.create(data.description)
                if data.description is not None
                else None
            ),
            group_id=Id.create(data.group_id),
            paid_by=Id.create(data.paid_by),
            splits=[
                Split.create(
                    participant_id=Id.create(split.participant_id),
                    amount=Amount.create(split.amount),
                )
                for split in data.splits
            ],
        )

        return Expense(entity_data)
