from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.entities.participant import Participant
from src.domain.groups.enumerations import ParticipantType
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases import CreateGroupUseCase
from src.domain.users.repositories import UsersRepository
from tests.mothers import GroupMother, UserMother

CREATOR_ID = "550e8400-e29b-41d4-a716-446655440000"


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


@pytest.fixture
def users_repository() -> AsyncMock:
    return create_autospec(UsersRepository, instance=True)


@pytest.fixture
def creator():
    return UserMother.create(id=CREATOR_ID, name="Alice")


@pytest.fixture
def group() -> Group:
    return GroupMother.create(name="Test Group")


class TestCreateGroupUseCase:
    async def test_creates_group_with_registered_creator_participant(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        creator,
        group: Group,
    ):
        users_repository.get_by_id.return_value = creator
        groups_repository.get_by_id.return_value = group

        use_case = CreateGroupUseCase(groups_repository, users_repository)
        result = await use_case(name="Friends", creator_id=CREATOR_ID)

        groups_repository.create.assert_awaited_once()
        created_arg: Group = groups_repository.create.call_args[0][0]
        assert isinstance(created_arg, Group)
        assert result is group

    async def test_created_group_has_one_registered_participant(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        creator,
        group: Group,
    ):
        users_repository.get_by_id.return_value = creator
        groups_repository.get_by_id.return_value = group

        use_case = CreateGroupUseCase(groups_repository, users_repository)
        await use_case(name="Friends", creator_id=CREATOR_ID)

        created_arg: Group = groups_repository.create.call_args[0][0]
        assert len(created_arg.participants) == 1
        participant = created_arg.participants[0]
        assert isinstance(participant, Participant)
        assert participant.type == ParticipantType.REGISTERED
        assert participant.user_id == CREATOR_ID
        assert participant.display_name == creator.name

    async def test_fetches_group_after_creation_and_returns_it(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        creator,
        group: Group,
    ):
        users_repository.get_by_id.return_value = creator
        groups_repository.get_by_id.return_value = group

        use_case = CreateGroupUseCase(groups_repository, users_repository)
        result = await use_case(name="Friends", creator_id=CREATOR_ID)

        created_arg: Group = groups_repository.create.call_args[0][0]
        groups_repository.get_by_id.assert_awaited_once_with(Id.create(created_arg.id))
        assert result is group

    async def test_created_group_has_owner_id_equal_to_creator_participant_id(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        creator,
        group: Group,
    ):
        users_repository.get_by_id.return_value = creator
        groups_repository.get_by_id.return_value = group

        use_case = CreateGroupUseCase(groups_repository, users_repository)
        await use_case(name="Friends", creator_id=CREATOR_ID)

        created_arg: Group = groups_repository.create.call_args[0][0]
        # owner_id must be the participant's id, NOT the user_id
        creator_participant = next(
            p for p in created_arg.participants if p.user_id == CREATOR_ID
        )
        assert created_arg.owner_id == creator_participant.id
        assert created_arg.owner_id != CREATOR_ID
