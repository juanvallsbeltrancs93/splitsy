from src.domain.users.entities import User, UserData
from src.domain.users.errors import UserAlreadyExistsError
from src.domain.users.ports import PasswordHasher
from src.domain.users.repositories import UsersRepository
from src.domain.users.value_objects import Email


class RegisterUserUseCase:
    def __init__(
        self,
        users_repository: UsersRepository,
        password_hasher: PasswordHasher,
    ) -> None:
        self._users_repository = users_repository
        self._password_hasher = password_hasher

    async def __call__(self, user_data: UserData) -> User:
        email = Email.create(user_data.email)

        existing_user = await self._users_repository.get_by_email(email)
        if existing_user is not None:
            raise UserAlreadyExistsError(
                f"User with email {user_data.email} already exists."
            )

        hashed_password = self._password_hasher.hash(user_data.password)

        user = User.create(
            UserData(
                name=user_data.name,
                email=user_data.email,
                password=hashed_password,
            )
        )

        await self._users_repository.create(user)

        return user
