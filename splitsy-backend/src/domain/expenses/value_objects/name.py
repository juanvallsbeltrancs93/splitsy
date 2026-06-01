from dataclasses import dataclass

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import ValueObject


@dataclass(frozen=True)
class NameProps:
    value: str


class Name(ValueObject[NameProps]):
    def __init__(self, props: NameProps) -> None:
        super().__init__(props)
        self._value = props.value

    @property
    def value(self) -> str:
        return self._value

    @staticmethod
    def create(value: str) -> "Name":
        if not isinstance(value, str):
            raise ValidationError(f"Invalid name format: {value}")

        if len(value) < 1:
            raise ValidationError("Name should have at least 1 character")

        if len(value) > 100:
            raise ValidationError("Name should have at most 100 characters")

        return Name(NameProps(value=value))
