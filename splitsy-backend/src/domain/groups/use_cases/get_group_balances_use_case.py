from dataclasses import dataclass
from decimal import Decimal

from src.domain.common.value_objects import Id
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from src.domain.settlements.repositories import SettlementsRepository


@dataclass(frozen=True)
class ParticipantBalance:
    participant_id: str
    balance: Decimal


class GetGroupBalancesUseCase:
    def __init__(
        self,
        groups_repository: GroupsRepository,
        expenses_repository: ExpensesRepository,
        settlements_repository: SettlementsRepository,
    ) -> None:
        self._groups_repository = groups_repository
        self._expenses_repository = expenses_repository
        self._settlements_repository = settlements_repository

    async def __call__(self, group_id: str) -> list[ParticipantBalance]:
        group = await self._groups_repository.get_by_id(Id.create(group_id))
        if group is None:
            raise GroupNotFoundError(f"Group with id {group_id} not found.")

        expenses = await self._expenses_repository.get_by_group_id(Id.create(group_id))
        settlements = await self._settlements_repository.get_by_group_id(
            Id.create(group_id)
        )

        balances: dict[str, Decimal] = {p.id: Decimal("0") for p in group.participants}

        for expense in expenses:
            expense.apply_to_balances(balances)

        for settlement in settlements:
            settlement.apply_to_balances(balances)

        return [
            ParticipantBalance(participant_id=k, balance=v) for k, v in balances.items()
        ]
