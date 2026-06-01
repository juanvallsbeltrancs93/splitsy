from dataclasses import dataclass

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects.value_object import ValueObject


@dataclass(frozen=True)
class DisplayNameProps:
    value: str


class DisplayName(ValueObject[DisplayNameProps]):
    def __init__(self, props: DisplayNameProps) -> None:
        super().__init__(props)
        self._value = props.value

    @property
    def value(self) -> str:
        return self._value

    @staticmethod
    def create(value: str) -> "DisplayName":
        if not isinstance(value, str):
            raise ValidationError(f"Invalid display name format: {value}")

        if len(value.strip()) < 2:
            raise ValidationError("Display name should have at least 2 characters")

        return DisplayName(DisplayNameProps(value=value))
