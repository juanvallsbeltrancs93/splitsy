from abc import ABC
from dataclasses import fields
from typing import Any, Generic, Protocol, TypeVar

from src.domain.common.value_objects.id import Id


class EntityData(Protocol):
    id: Id


T = TypeVar("T", bound=EntityData)


class Entity(ABC, Generic[T]):
    def __init__(self, id: Id, data: T | None = None) -> None:
        self._id = id
        self._data = data

    @property
    def id(self) -> str:
        return self._id.value

    def equals(self, obj: object) -> bool:
        if obj is None:
            return False

        if not isinstance(obj, Entity):
            return False

        if self is obj:
            return True

        return self.id == obj.id

    def to_dict(self) -> dict[str, Any]:
        if self._data is None:
            return {"id": self.id}

        result = {}
        for f in fields(self._data):
            # Omit hidden fields
            if not f.repr:
                continue

            value = getattr(self._data, f.name)
            result[f.name] = value.value if hasattr(value, "value") else value

        return result

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Entity):
            return NotImplemented

        return self.equals(other)

    def __hash__(self) -> int:
        return hash(self.id)

    def __repr__(self) -> str:
        return f"{type(self).__name__}(id={self.id!r})"
