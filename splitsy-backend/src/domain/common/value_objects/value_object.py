from abc import ABC
from dataclasses import fields, is_dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


class ValueObject(ABC, Generic[T]):
    def __init__(self, props: T) -> None:
        self._props = props

    @property
    def props(self) -> T:
        return self._props

    def equals(self, vo: "ValueObject[T] | None") -> bool:
        if vo is None or not isinstance(vo, ValueObject):
            return False
        return self.props == vo.props

    def __eq__(self, other: object) -> bool:
        # Return NotImplemented so Python can try other.__eq__(self)
        if not isinstance(other, ValueObject):
            return NotImplemented

        return self.equals(other)

    def __hash__(self) -> int:
        return hash(self.props)

    def __repr__(self) -> str:
        return f"{type(self).__name__}({self.__repr_value()})"

    def __repr_value(self) -> str:
        if not is_dataclass(self.props):
            return repr(self.props)

        items = [f for f in fields(self.props) if f.repr]

        if not items:
            return "<hidden>"

        if len(items) == 1:
            val = getattr(self.props, items[0].name)
            return f"{val!r}"

        return ", ".join(f"{f.name}={getattr(self.props, f.name)!r}" for f in items)
