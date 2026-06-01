from unittest.mock import AsyncMock, MagicMock, create_autospec

import pytest

from src.domain.users.entities import User
from src.domain.users.entities.user import UserData
from src.domain.users.errors import UserAlreadyExistsError
from src.domain.users.ports import PasswordHasher
from src.domain.users.repositories import UsersRepository
from src.domain.users.use_cases import RegisterUserUseCase
from tests.mothers import UserMother


@pytest.fixture
def repository() -> AsyncMock:
    return create_autospec(UsersRepository, instance=True)


@pytest.fixture
def password_hasher() -> MagicMock:
    mock = create_autospec(PasswordHasher, instance=True)
    mock.hash.return_value = "hashed_Password123!"
    return mock


@pytest.fixture
def user() -> User:
    return UserMother.create()


class TestRegisterUserUseCase:
    async def test_should_register_new_user_successfully(
        self, repository: AsyncMock, password_hasher: MagicMock, user: User
    ):
        repository.get_by_email.return_value = None

        use_case = RegisterUserUseCase(repository, password_hasher)
        result = await use_case(
            UserData(
                name="Nicolas", email="nicolas@example.com", password="Password123!"
            )
        )

        repository.create.assert_awaited_once()
        password_hasher.hash.assert_called_once_with("Password123!")
        assert isinstance(result, User)

    async def test_should_raise_when_email_already_exists(
        self, repository: AsyncMock, password_hasher: MagicMock, user: User
    ):
        repository.get_by_email.return_value = user

        use_case = RegisterUserUseCase(repository, password_hasher)

        with pytest.raises(UserAlreadyExistsError, match="already exists"):
            await use_case(
                UserData(
                    name="Nicolas",
                    email="nicolas@example.com",
                    password="Password123!",
                )
            )

    async def test_should_not_create_user_when_email_already_exists(
        self, repository: AsyncMock, password_hasher: MagicMock, user: User
    ):
        repository.get_by_email.return_value = user

        use_case = RegisterUserUseCase(repository, password_hasher)

        with pytest.raises(UserAlreadyExistsError):
            await use_case(
                UserData(
                    name="Nicolas",
                    email="nicolas@example.com",
                    password="Password123!",
                )
            )

        repository.create.assert_not_awaited()

    async def test_should_hash_password_before_storing(
        self, repository: AsyncMock, password_hasher: MagicMock
    ):
        repository.get_by_email.return_value = None

        use_case = RegisterUserUseCase(repository, password_hasher)
        await use_case(
            UserData(
                name="Nicolas", email="nicolas@example.com", password="Password123!"
            )
        )

        created_user: User = repository.create.call_args[0][0]
        assert created_user.hashed_password == "hashed_Password123!"
