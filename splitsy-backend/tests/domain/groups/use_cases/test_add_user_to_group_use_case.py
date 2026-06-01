from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.groups.entities import Group
from src.domain.groups.entities.participant import ParticipantData
from src.domain.groups.errors import (
    GroupNotFoundError,
    ParticipantNameAlreadyInGroupError,
)
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases.add_user_to_group_use_case import AddUserToGroupUseCase
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


class TestAddUserToGroupUseCase:
    async def test_adds_user_to_group_and_returns_updated_group(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        new_user = UserMother.create(id="aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee")
        group = GroupMother.create()  # default participants do NOT include new_user
        users_repository.get_by_id.return_value = new_user
        groups_repository.get_by_id.return_value = group

        use_case = AddUserToGroupUseCase(groups_repository, users_repository)
        result = await use_case(group.id, new_user.id)

        groups_repository.update.assert_awaited_once_with(group)
        assert result is group

    async def test_raises_user_not_found_when_user_does_not_exist(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        group: Group,
    ):
        users_repository.get_by_id.return_value = None

        use_case = AddUserToGroupUseCase(groups_repository, users_repository)

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

        use_case = AddUserToGroupUseCase(groups_repository, users_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case("660e8400-e29b-41d4-a716-446655440001", user.id)

        groups_repository.update.assert_not_awaited()

    async def test_raises_user_already_exists_when_user_already_in_group(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
        user: User,
    ):
        group_with_user = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name=user.name,
                    type="REGISTERED",
                    user_id=user.id,
                )
            ]
        )
        users_repository.get_by_id.return_value = user
        groups_repository.get_by_id.return_value = group_with_user

        use_case = AddUserToGroupUseCase(groups_repository, users_repository)

        with pytest.raises(ParticipantNameAlreadyInGroupError):
            await use_case(group_with_user.id, user.id)

        groups_repository.update.assert_not_awaited()
