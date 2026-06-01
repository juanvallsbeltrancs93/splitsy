import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.settlements.entities.settlement import Settlement
from src.infrastructure.settlements.relational_db.mapper import SettlementMapper
from src.infrastructure.settlements.relational_db.relational_db_settlements_repository import (
    RelationalDBSettlementsRepository,
)
from tests.mothers import SettlementMother


@pytest.fixture
def repo(session: AsyncSession) -> RelationalDBSettlementsRepository:
    return RelationalDBSettlementsRepository(session, SettlementMapper())


@pytest.fixture
def settlement() -> Settlement:
    return SettlementMother.create()


class TestRelationalDBSettlementsRepository:
    async def test_create_and_get_by_id(
        self, repo: RelationalDBSettlementsRepository, settlement: Settlement
    ):
        await repo.create(settlement)

        found = await repo.get_by_id(Id.create(settlement.id))

        assert found is not None
        assert found.id == settlement.id
        assert found.group_id == settlement.group_id
        assert found.from_participant_id == settlement.from_participant_id
        assert found.to_participant_id == settlement.to_participant_id
        assert found.amount == settlement.amount

    async def test_get_by_group_id(
        self, repo: RelationalDBSettlementsRepository, settlement: Settlement
    ):
        group_id = settlement.group_id
        second_settlement = SettlementMother.create(id=Id.create().value)
        await repo.create(settlement)
        await repo.create(second_settlement)

        results = await repo.get_by_group_id(Id.create(group_id))

        assert len(results) == 2

    async def test_get_by_group_id_returns_empty_list_when_none(
        self, repo: RelationalDBSettlementsRepository
    ):
        results = await repo.get_by_group_id(Id.create())

        assert results == []

    async def test_get_by_id_returns_none_when_not_found(
        self, repo: RelationalDBSettlementsRepository
    ):
        found = await repo.get_by_id(Id.create())

        assert found is None

    async def test_delete(
        self, repo: RelationalDBSettlementsRepository, settlement: Settlement
    ):
        await repo.create(settlement)

        await repo.delete(Id.create(settlement.id))

        found = await repo.get_by_id(Id.create(settlement.id))
        assert found is None
