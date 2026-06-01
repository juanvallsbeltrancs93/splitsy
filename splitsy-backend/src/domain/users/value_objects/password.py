import re
from dataclasses import dataclass, field

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import ValueObject

PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$")


@dataclass(frozen=True)
class PasswordProps:
    value: str = field(repr=False)


class Password(ValueObject[PasswordProps]):
    def __init__(self, props: PasswordProps) -> None:
        super().__init__(props)
        self._value = props.value

    def get_secret_value(self) -> str:
        return self._value

    @staticmethod
    def create(value: str) -> "Password":
        if not isinstance(value, str):
            raise ValidationError(f"Invalid format: {value}")

        if not PASSWORD_REGEX.match(value):
            raise ValidationError(
                "Must be at least 8 characters long and include "
                "uppercase, lowercase, number, and special character."
            )

        return Password(PasswordProps(value=value))

    def __str__(self) -> str:
        return "<hidden>"
