from abc import ABC, abstractmethod

from src.domain.common.value_objects import Id
from src.domain.users.entities import User
from src.domain.users.value_objects import Email


class UsersRepository(ABC):
    @abstractmethod
    async def get_by_id(self, id: Id) -> User | None:
        pass

    @abstractmethod
    async def get_by_email(self, email: Email) -> User | None:
        pass

    @abstractmethod
    async def create(self, user: User) -> None:
        pass

    @abstractmethod
    async def update(self, user: User) -> None:
        pass

    @abstractmethod
    async def delete(self, id: Id) -> None:
        pass
