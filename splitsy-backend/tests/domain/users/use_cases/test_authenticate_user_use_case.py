from unittest.mock import AsyncMock, MagicMock, create_autospec

import pytest

from src.domain.users.entities import User
from src.domain.users.errors import InvalidCredentialsError
from src.domain.users.ports import PasswordHasher
from src.domain.users.repositories import UsersRepository
from src.domain.users.use_cases import AuthenticateUserUseCase
from tests.mothers import UserMother


@pytest.fixture
def repository() -> AsyncMock:
    return create_autospec(UsersRepository, instance=True)


@pytest.fixture
def password_hasher() -> MagicMock:
    mock = create_autospec(PasswordHasher, instance=True)
    mock.verify.return_value = True
    return mock


@pytest.fixture
def user() -> User:
    return UserMother.create()


class TestAuthenticateUserUseCase:
    async def test_should_return_user_on_valid_credentials(
        self, repository: AsyncMock, password_hasher: MagicMock, user: User
    ):
        repository.get_by_email.return_value = user

        use_case = AuthenticateUserUseCase(repository, password_hasher)
        result = await use_case("nicolas@example.com", "Password123!")

        assert result is user

    async def test_should_raise_when_user_not_found(
        self, repository: AsyncMock, password_hasher: MagicMock
    ):
        repository.get_by_email.return_value = None

        use_case = AuthenticateUserUseCase(repository, password_hasher)

        with pytest.raises(InvalidCredentialsError, match="Invalid email or password"):
            await use_case("unknown@example.com", "Password123!")

    async def test_should_raise_when_password_is_wrong(
        self, repository: AsyncMock, password_hasher: MagicMock, user: User
    ):
        repository.get_by_email.return_value = user
        password_hasher.verify.return_value = False

        use_case = AuthenticateUserUseCase(repository, password_hasher)

        with pytest.raises(InvalidCredentialsError, match="Invalid email or password"):
            await use_case("nicolas@example.com", "WrongPass1!")

    async def test_should_not_reveal_which_field_is_wrong(
        self, repository: AsyncMock, password_hasher: MagicMock
    ):
        """Both user-not-found and wrong-password return the same message."""
        repository.get_by_email.return_value = None

        use_case = AuthenticateUserUseCase(repository, password_hasher)

        with pytest.raises(InvalidCredentialsError) as exc_not_found:
            await use_case("unknown@example.com", "Password123!")

        password_hasher.verify.return_value = False
        repository.get_by_email.return_value = UserMother.create()

        with pytest.raises(InvalidCredentialsError) as exc_wrong_pass:
            await use_case("nicolas@example.com", "WrongPass1!")

        assert str(exc_not_found.value) == str(exc_wrong_pass.value)
