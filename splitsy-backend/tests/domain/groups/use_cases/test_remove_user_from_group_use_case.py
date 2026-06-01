from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.groups.entities import Group
from src.domain.groups.errors import GroupNotFoundError, ParticipantNotFoundInGroupError
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases.remove_user_from_group_use_case import (
    RemoveUserFromGroup,
)
from src.domain.users.entities import User
from src.domain.users.errors import UserNotFoundError
from src.domain.users.repositories import UsersRepository
from tests.mothers import GroupMother, UserMother


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


@pytest.fixture
def users_repository() -> AsyncMock:
    return create_autospec(UsersRepository, instance=True)


@pytest.fixture
def user() -> User:
    return UserMother.create()


@pytest.fixture
def group() -> Group:
    return GroupMother.create()


class TestRemoveUserFromGroup:
    async def test_removes_user_from_group_and_returns_updated_group(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        user: User,
        group: Group,
    ):
        users_repository.get_by_id.return_value = user
        groups_repository.get_by_id.return_value = group

        use_case = RemoveUserFromGroup(groups_repository, users_repository)
        result = await use_case(group.id, user.id)

        groups_repository.update.assert_awaited_once_with(group)
        assert result is group
        assert user.id not in result.participants

    async def test_raises_user_not_found_when_user_does_not_exist(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        group: Group,
    ):
        users_repository.get_by_id.return_value = None

        use_case = RemoveUserFromGroup(groups_repository, users_repository)

        with pytest.raises(UserNotFoundError):
            await use_case(group.id, "550e8400-e29b-41d4-a716-446655440001")

        groups_repository.get_by_id.assert_not_awaited()
        groups_repository.update.assert_not_awaited()

    async def test_raises_group_not_found_when_group_does_not_exist(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        user: User,
    ):
        users_repository.get_by_id.return_value = user
        groups_repository.get_by_id.return_value = None

        use_case = RemoveUserFromGroup(groups_repository, users_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case("660e8400-e29b-41d4-a716-446655440001", user.id)

        groups_repository.update.assert_not_awaited()

    async def test_raises_user_not_found_in_group_when_user_is_not_a_participant(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        user_not_in_group = UserMother.create(id="aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee")
        group_without_user = GroupMother.create(participants=[])
        users_repository.get_by_id.return_value = user_not_in_group
        groups_repository.get_by_id.return_value = group_without_user

        use_case = RemoveUserFromGroup(groups_repository, users_repository)

        with pytest.raises(ParticipantNotFoundInGroupError):
            await use_case(group_without_user.id, user_not_in_group.id)

        groups_repository.update.assert_not_awaited()
