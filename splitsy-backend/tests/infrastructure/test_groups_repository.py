import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.entities.participant import Participant, ParticipantData
from src.domain.groups.enumerations import ParticipantType
from src.infrastructure.groups.relational_db.mapper import GroupMapper
from src.infrastructure.groups.relational_db.relational_db_groups_repository import (
    RelationalDBGroupsRepository,
)
from tests.mothers import GroupMother


@pytest.fixture
def repo(session: AsyncSession) -> RelationalDBGroupsRepository:
    return RelationalDBGroupsRepository(session, GroupMapper())


@pytest.fixture
def group() -> Group:
    return GroupMother.create()


class TestRelationalDBGroupsRepository:
    async def test_create_and_get_by_id(
        self, repo: RelationalDBGroupsRepository, group: Group
    ):
        await repo.create(group)

        found = await repo.get_by_id(Id.create(group.id))

        assert found is not None
        assert found.id == group.id
        assert found.name == group.name
        assert found.currency == group.currency
        assert len(found.participants) == len(group.participants)
        for p in found.participants:
            assert isinstance(p, Participant)
            assert p.display_name is not None
            assert p.type in (
                ParticipantType.REGISTERED,
                ParticipantType.NON_REGISTERED,
            )

    async def test_get_by_id_returns_none_when_not_found(
        self, repo: RelationalDBGroupsRepository
    ):
        found = await repo.get_by_id(Id.create())

        assert found is None

    async def test_update(self, repo: RelationalDBGroupsRepository, group: Group):
        await repo.create(group)

        new_participant = Participant.create_non_registered("Bob")
        group.add_participant(new_participant)
        await repo.update(group)

        found = await repo.get_by_id(Id.create(group.id))
        assert found is not None
        assert any(p.id == new_participant.id for p in found.participants)

    async def test_delete(self, repo: RelationalDBGroupsRepository, group: Group):
        await repo.create(group)

        await repo.delete(Id.create(group.id))

        found = await repo.get_by_id(Id.create(group.id))
        assert found is None

    async def test_list_by_participant(self, repo: RelationalDBGroupsRepository):
        user_id = Id.create()
        registered = ParticipantData(
            display_name="Alice", type="REGISTERED", user_id=user_id.value
        )
        group1 = GroupMother.create(id=Id.create().value, participants=[registered])
        group2 = GroupMother.create(id=Id.create().value)
        await repo.create(group1)
        await repo.create(group2)

        result = await repo.list_by_participant(user_id)

        assert len(result) == 1
        assert result[0].id == group1.id
        assert all(isinstance(g, Group) for g in result)

    async def test_registered_and_alias_participants_both_returned(
        self, repo: RelationalDBGroupsRepository
    ):
        user_id = Id.create()
        registered = ParticipantData(
            display_name="Alice", type="REGISTERED", user_id=user_id.value
        )
        alias = ParticipantData(display_name="Bob", type="NON_REGISTERED")
        group = GroupMother.create(
            id=Id.create().value, participants=[registered, alias]
        )
        await repo.create(group)

        found = await repo.get_by_id(Id.create(group.id))

        assert found is not None
        assert len(found.participants) == 2
        types = {p.type for p in found.participants}
        assert types == {ParticipantType.REGISTERED, ParticipantType.NON_REGISTERED}
        registered_p = next(
            p for p in found.participants if p.type == ParticipantType.REGISTERED
        )
        alias_p = next(
            p for p in found.participants if p.type == ParticipantType.NON_REGISTERED
        )
        assert registered_p.user_id == user_id.value
        assert alias_p.user_id is None

    async def test_owner_id_unchanged_after_remove_participant(
        self, repo: RelationalDBGroupsRepository
    ):
        """Regression: owner_id must not change when owner removes another participant."""
        owner_user_id = "aaaaaaaa-0000-0000-0000-000000000001"
        user2_id = "bbbbbbbb-0000-0000-0000-000000000002"
        participant1_id = "cccccccc-0000-0000-0000-000000000001"
        participant2_id = "cccccccc-0000-0000-0000-000000000002"

        group = GroupMother.create(
            id="dddddddd-0000-0000-0000-000000000001",
            owner_id=participant1_id,
            participants=[
                ParticipantData(
                    id=participant1_id,
                    display_name="Owner User",
                    type="REGISTERED",
                    user_id=owner_user_id,
                ),
                ParticipantData(
                    id=participant2_id,
                    display_name="User Two",
                    type="REGISTERED",
                    user_id=user2_id,
                ),
            ],
        )

        # 1. persist
        await repo.create(group)

        # 2. reload and verify initial state
        loaded = await repo.get_by_id(Id.create(group.id))
        assert loaded is not None
        assert loaded.owner_id == participant1_id

        # 3. owner removes user-2
        loaded.remove_participant(Id.create(participant2_id), requester_id=owner_user_id)
        await repo.update(loaded)

        # 4. reload and assert owner_id is unchanged
        after = await repo.get_by_id(Id.create(group.id))
        assert after is not None
        assert after.owner_id == participant1_id, (
            f"Bug: owner_id changed to '{after.owner_id}' after removing a participant"
        )

        # 5. verify the right participant was deactivated
        p1 = next((p for p in after.participants if p.id == participant1_id), None)
        p2 = next((p for p in after.participants if p.id == participant2_id), None)
        assert p1 is not None and p1.is_active, "Owner participant should still be active"
        assert p2 is not None and not p2.is_active, "Removed participant should be inactive"
