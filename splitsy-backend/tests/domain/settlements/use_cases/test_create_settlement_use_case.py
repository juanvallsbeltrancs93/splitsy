from decimal import Decimal
from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.groups.errors import GroupNotFoundError, ParticipantNotFoundInGroupError
from src.domain.groups.repositories import GroupsRepository
from src.domain.settlements.entities import Settlement
from src.domain.settlements.entities.settlement import SettlementData
from src.domain.settlements.repositories import SettlementsRepository
from src.domain.settlements.use_cases import CreateSettlementUseCase
from tests.mothers import GroupMother, SettlementMother


@pytest.fixture
def settlements_repository() -> AsyncMock:
    return create_autospec(SettlementsRepository, instance=True)


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


class TestCreateSettlementUseCase:
    async def test_should_create_settlement_successfully(
        self,
        settlements_repository: AsyncMock,
        groups_repository: AsyncMock,
    ):
        group_with_two = GroupMother.create_with_two_participants()
        participant_ids_two = [p.id for p in group_with_two.participants]
        groups_repository.get_by_id.return_value = group_with_two

        settlement_data = SettlementData(
            group_id=group_with_two.id,
            from_participant_id=participant_ids_two[0],
            to_participant_id=participant_ids_two[1],
            amount=Decimal("20.00"),
            date=SettlementMother._DEFAULT_DATE,
        )

        use_case = CreateSettlementUseCase(settlements_repository, groups_repository)
        result = await use_case(settlement_data)

        settlements_repository.create.assert_awaited_once()
        assert isinstance(result, Settlement)

    async def test_should_raise_when_group_not_found(
        self,
        settlements_repository: AsyncMock,
        groups_repository: AsyncMock,
    ):
        groups_repository.get_by_id.return_value = None
        missing_group_id = Id.create().value

        settlement_data = SettlementData(
            group_id=missing_group_id,
            from_participant_id=Id.create().value,
            to_participant_id=Id.create().value,
            amount=Decimal("20.00"),
            date=SettlementMother._DEFAULT_DATE,
        )

        use_case = CreateSettlementUseCase(settlements_repository, groups_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case(settlement_data)

    async def test_should_raise_when_from_participant_not_in_group(
        self,
        settlements_repository: AsyncMock,
        groups_repository: AsyncMock,
    ):
        group = GroupMother.create()
        groups_repository.get_by_id.return_value = group
        missing_participant_id = Id.create().value

        settlement_data = SettlementData(
            group_id=GroupMother._DEFAULT_ID,
            from_participant_id=missing_participant_id,
            to_participant_id=Id.create().value,
            amount=Decimal("20.00"),
            date=SettlementMother._DEFAULT_DATE,
        )

        use_case = CreateSettlementUseCase(settlements_repository, groups_repository)

        with pytest.raises(ParticipantNotFoundInGroupError):
            await use_case(settlement_data)
