import re
from dataclasses import dataclass

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import ValueObject

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


@dataclass(frozen=True)
class EmailProps:
    value: str


class Email(ValueObject[EmailProps]):
    def __init__(self, props: EmailProps) -> None:
        super().__init__(props)
        self._value = props.value

    @property
    def value(self) -> str:
        return self._value

    @staticmethod
    def create(value: str) -> "Email":
        if not isinstance(value, str):
            raise ValidationError(f"Invalid format: {value}")

        if not EMAIL_REGEX.match(value):
            raise ValidationError("Invalid email format")

        email = value.lower()

        return Email(EmailProps(value=email))
