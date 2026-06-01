from decimal import Decimal
from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.groups.entities.participant import ParticipantData
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases import GetGroupBalancesUseCase
from src.domain.settlements.repositories import SettlementsRepository
from tests.mothers import ExpenseMother, GroupMother, SettlementMother


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


@pytest.fixture
def expenses_repository() -> AsyncMock:
    return create_autospec(ExpensesRepository, instance=True)


@pytest.fixture
def settlements_repository() -> AsyncMock:
    return create_autospec(SettlementsRepository, instance=True)


PARTICIPANT_A_ID = "550e8400-e29b-41d4-a716-446655440000"
PARTICIPANT_B_ID = "440e8400-e29b-41d4-a716-446655440000"


class TestGetGroupBalancesUseCase:
    async def test_should_raise_when_group_not_found(
        self,
        groups_repository: AsyncMock,
        expenses_repository: AsyncMock,
        settlements_repository: AsyncMock,
    ):
        groups_repository.get_by_id.return_value = None

        use_case = GetGroupBalancesUseCase(
            groups_repository, expenses_repository, settlements_repository
        )

        with pytest.raises(GroupNotFoundError):
            await use_case(Id.create().value)

    async def test_payer_is_credited_and_split_participants_are_debited(
        self,
        groups_repository: AsyncMock,
        expenses_repository: AsyncMock,
        settlements_repository: AsyncMock,
    ):
        from src.domain.expenses.entities.expense import SplitData

        group = GroupMother.create(
            participants=[
                ParticipantData(
                    id=PARTICIPANT_A_ID,
                    display_name="User A",
                    type="NON_REGISTERED",
                ),
                ParticipantData(
                    id=PARTICIPANT_B_ID,
                    display_name="User B",
                    type="NON_REGISTERED",
                ),
            ]
        )
        groups_repository.get_by_id.return_value = group
        settlements_repository.get_by_group_id.return_value = []

        expense = ExpenseMother.create(
            amount=Decimal("60.00"),
            paid_by=PARTICIPANT_A_ID,
            group_id=group.id,
            splits=[
                SplitData(participant_id=PARTICIPANT_A_ID, amount=Decimal("30.00")),
                SplitData(participant_id=PARTICIPANT_B_ID, amount=Decimal("30.00")),
            ],
        )
        expenses_repository.get_by_group_id.return_value = [expense]

        use_case = GetGroupBalancesUseCase(
            groups_repository, expenses_repository, settlements_repository
        )
        result = await use_case(group.id)

        balances = {b.participant_id: b.balance for b in result}
        assert balances[PARTICIPANT_A_ID] == Decimal("30.00")
        assert balances[PARTICIPANT_B_ID] == Decimal("-30.00")

    async def test_settlement_reduces_debt(
        self,
        groups_repository: AsyncMock,
        expenses_repository: AsyncMock,
        settlements_repository: AsyncMock,
    ):
        from src.domain.expenses.entities.expense import SplitData

        group = GroupMother.create(
            participants=[
                ParticipantData(
                    id=PARTICIPANT_A_ID,
                    display_name="User A",
                    type="NON_REGISTERED",
                ),
                ParticipantData(
                    id=PARTICIPANT_B_ID,
                    display_name="User B",
                    type="NON_REGISTERED",
                ),
            ]
        )
        groups_repository.get_by_id.return_value = group

        expense = ExpenseMother.create(
            amount=Decimal("60.00"),
            paid_by=PARTICIPANT_A_ID,
            group_id=group.id,
            splits=[
                SplitData(participant_id=PARTICIPANT_A_ID, amount=Decimal("30.00")),
                SplitData(participant_id=PARTICIPANT_B_ID, amount=Decimal("30.00")),
            ],
        )
        expenses_repository.get_by_group_id.return_value = [expense]

        settlement = SettlementMother.create(
            from_participant_id=PARTICIPANT_B_ID,
            to_participant_id=PARTICIPANT_A_ID,
            amount=Decimal("30.00"),
            group_id=group.id,
        )
        settlements_repository.get_by_group_id.return_value = [settlement]

        use_case = GetGroupBalancesUseCase(
            groups_repository, expenses_repository, settlements_repository
        )
        result = await use_case(group.id)

        balances = {b.participant_id: b.balance for b in result}
        assert balances[PARTICIPANT_A_ID] == Decimal("0.00")
        assert balances[PARTICIPANT_B_ID] == Decimal("0.00")

    async def test_returns_zero_balances_when_no_expenses_or_settlements(
        self,
        groups_repository: AsyncMock,
        expenses_repository: AsyncMock,
        settlements_repository: AsyncMock,
    ):
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    id=PARTICIPANT_A_ID,
                    display_name="User A",
                    type="NON_REGISTERED",
                ),
            ]
        )
        groups_repository.get_by_id.return_value = group
        expenses_repository.get_by_group_id.return_value = []
        settlements_repository.get_by_group_id.return_value = []

        use_case = GetGroupBalancesUseCase(
            groups_repository, expenses_repository, settlements_repository
        )
        result = await use_case(group.id)

        assert len(result) == 1
        assert result[0].participant_id == PARTICIPANT_A_ID
        assert result[0].balance == Decimal("0")
