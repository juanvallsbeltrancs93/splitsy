import re
from dataclasses import dataclass

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects.value_object import ValueObject


@dataclass(frozen=True)
class CurrencyProps:
    value: str


class Currency(ValueObject[CurrencyProps]):
    _ISO_4217_PATTERN = re.compile(r"^[A-Z]{3}$")

    def __init__(self, props: CurrencyProps) -> None:
        super().__init__(props)
        self._value = props.value

    @property
    def value(self) -> str:
        return self._value

    @staticmethod
    def create(value: str) -> "Currency":
        if not isinstance(value, str):
            raise ValidationError(
                f"Currency must be a string, got {type(value).__name__}"
            )
        if not Currency._ISO_4217_PATTERN.match(value):
            raise ValidationError(
                f"Invalid currency code: {value!r}. Expected ISO 4217 (3 uppercase letters)."
            )
        return Currency(CurrencyProps(value=value))
