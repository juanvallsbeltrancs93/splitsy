from dataclasses import dataclass
from uuid import UUID, uuid4

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects.value_object import ValueObject


@dataclass(frozen=True)
class IdProps:
    value: str


class Id(ValueObject[IdProps]):
    def __init__(self, props: IdProps) -> None:
        super().__init__(props)
        self._value = props.value

    @property
    def value(self) -> str:
        return self._value

    @staticmethod
    def create(id: str | None = None) -> "Id":
        if id is None:
            return Id(IdProps(value=str(uuid4())))

        try:
            uuid_obj = UUID(id)

            return Id(IdProps(value=str(uuid_obj)))
        except (AttributeError, ValueError):
            raise ValidationError(f"Invalid Id format: {id}")

    def to_uuid(self) -> UUID:
        return UUID(self.value)

    def __repr__(self) -> str:
        return f"Id(value='{self.value}')"

    def __str__(self) -> str:
        return self.value
