from abc import ABC, abstractmethod

from src.domain.common.value_objects import Id
from src.domain.expenses.entities import Expense


class ExpensesRepository(ABC):
    @abstractmethod
    async def get_by_id(self, id: Id) -> Expense | None:
        pass

    @abstractmethod
    async def get_by_group_id(self, group_id: Id) -> list[Expense]:
        pass

    @abstractmethod
    async def create(self, expense: Expense) -> None:
        pass

    @abstractmethod
    async def update(self, expense: Expense) -> None:
        pass

    @abstractmethod
    async def delete(self, id: Id) -> None:
        pass

    @abstractmethod
    async def delete_by_group_id(self, group_id: Id) -> None: ...
