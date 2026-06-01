from dataclasses import dataclass

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects.value_object import ValueObject


@dataclass(frozen=True)
class DescriptionProps:
    value: str


class Description(ValueObject[DescriptionProps]):
    def __init__(self, props: DescriptionProps) -> None:
        super().__init__(props)
        self._value = props.value

    @property
    def value(self) -> str:
        return self._value

    @staticmethod
    def create(value: str) -> "Description":
        if not isinstance(value, str):
            raise ValidationError(f"Invalid description format: {value}")

        if len(value) < 1:
            raise ValidationError("Description should have at least 1 character")

        if len(value) > 280:
            raise ValidationError("Description should have at most 280 characters")

        return Description(DescriptionProps(value=value))
