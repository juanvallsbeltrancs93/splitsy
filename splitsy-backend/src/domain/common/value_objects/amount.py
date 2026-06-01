from dataclasses import dataclass
from decimal import ROUND_DOWN, Decimal

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects.value_object import ValueObject


@dataclass(frozen=True)
class AmountProps:
    value: Decimal


class Amount(ValueObject[AmountProps]):
    def __init__(self, props: AmountProps) -> None:
        super().__init__(props)
        self._value = props.value

    @property
    def value(self) -> Decimal:
        return self._value

    @staticmethod
    def create(value: Decimal) -> "Amount":
        if not isinstance(value, Decimal):
            raise ValidationError(f"Invalid amount format: {value}")

        normalized_value = value.quantize(Decimal("0.01"), rounding=ROUND_DOWN)

        if normalized_value < Decimal("0"):
            raise ValidationError("Amount cannot be less than 0")

        return Amount(AmountProps(value=normalized_value))
