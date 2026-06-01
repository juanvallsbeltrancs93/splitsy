from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.users.entities import User
from src.domain.users.errors import UserNotFoundError
from src.domain.users.repositories import UsersRepository
from src.domain.users.use_cases import GetUserUseCase
from tests.mothers import UserMother


@pytest.fixture
def repository() -> AsyncMock:
    return create_autospec(UsersRepository, instance=True)


@pytest.fixture
def user() -> User:
    return UserMother.create()


class TestGetUserUseCase:
    async def test_should_return_user_when_found(
        self, repository: AsyncMock, user: User
    ):
        repository.get_by_id.return_value = user

        use_case = GetUserUseCase(repository)
        result = await use_case(user.id)

        repository.get_by_id.assert_awaited_once_with(Id.create(user.id))
        assert result is user

    async def test_should_raise_when_user_not_found(self, repository: AsyncMock):
        repository.get_by_id.return_value = None
        missing_id = Id.create().value

        use_case = GetUserUseCase(repository)

        with pytest.raises(UserNotFoundError, match=missing_id):
            await use_case(missing_id)
