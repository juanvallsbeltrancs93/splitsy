from src.domain.users.entities import User
from src.domain.users.errors import UserNotFoundError
from src.domain.users.repositories import UsersRepository
from src.domain.common.value_objects import Id


class GetUserUseCase:
    def __init__(self, users_repository: UsersRepository) -> None:
        self._users_repository = users_repository

    async def __call__(self, user_id: str) -> User:
        user = await self._users_repository.get_by_id(Id.create(user_id))

        if user is None:
            raise UserNotFoundError(f"User with id {user_id} not found.")

        return user
