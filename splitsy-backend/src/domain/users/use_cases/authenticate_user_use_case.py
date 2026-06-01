from src.domain.users.entities import User
from src.domain.users.errors import InvalidCredentialsError
from src.domain.users.ports import PasswordHasher
from src.domain.users.repositories import UsersRepository
from src.domain.users.value_objects import Email


class AuthenticateUserUseCase:
    def __init__(
        self,
        users_repository: UsersRepository,
        password_hasher: PasswordHasher,
    ) -> None:
        self._users_repository = users_repository
        self._password_hasher = password_hasher

    async def __call__(self, email: str, password: str) -> User:
        user = await self._users_repository.get_by_email(Email.create(email))

        if user is None:
            raise InvalidCredentialsError("Invalid email or password.")

        if not self._password_hasher.verify(password, user.hashed_password):
            raise InvalidCredentialsError("Invalid email or password.")

        return user
