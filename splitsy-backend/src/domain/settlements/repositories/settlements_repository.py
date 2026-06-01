from abc import ABC, abstractmethod

from src.domain.common.value_objects import Id
from src.domain.settlements.entities import Settlement


class SettlementsRepository(ABC):
    @abstractmethod
    async def get_by_id(self, id: Id) -> Settlement | None:
        pass

    @abstractmethod
    async def get_by_group_id(self, group_id: Id) -> list[Settlement]:
        pass

    @abstractmethod
    async def create(self, settlement: Settlement) -> None:
        pass

    @abstractmethod
    async def delete(self, id: Id) -> None:
        pass

    @abstractmethod
    async def delete_by_group_id(self, group_id: Id) -> None: ...
