from dataclasses import dataclass

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects.value_object import ValueObject


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

        name = str(value).lower()

        if len(name) < 2:
            raise ValidationError("Should have at least 2 characters")

        return Name(NameProps(value=name))
