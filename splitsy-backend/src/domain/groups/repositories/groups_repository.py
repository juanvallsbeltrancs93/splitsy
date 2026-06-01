from abc import ABC, abstractmethod

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group


class GroupsRepository(ABC):
    @abstractmethod
    async def get_by_id(self, id: Id) -> Group | None:
        pass

    @abstractmethod
    async def create(self, group: Group) -> None:
        pass

    @abstractmethod
    async def update(self, group: Group) -> None:
        pass

    @abstractmethod
    async def delete(self, id: Id) -> None:
        pass

    @abstractmethod
    async def list_by_participant(self, user_id: Id) -> list[Group]:
        pass
