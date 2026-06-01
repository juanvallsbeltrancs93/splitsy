import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.domain.common.value_objects import Id
from src.domain.users.entities.user import User, UserData
from src.domain.users.value_objects import Email
from src.infrastructure.users.relational_db.mapper import UserMapper
from src.infrastructure.users.relational_db.relational_db_users_repository import (
    RelationalDBUsersRepository,
)
from tests.mothers import UserMother


@pytest.fixture
def repo(session: AsyncSession) -> RelationalDBUsersRepository:
    return RelationalDBUsersRepository(session, UserMapper())


@pytest.fixture
def user() -> User:
    return UserMother.create()


class TestRelationalDBUsersRepository:
    async def test_create_and_get_by_id(
        self, repo: RelationalDBUsersRepository, user: User
    ):
        await repo.create(user)

        found = await repo.get_by_id(Id.create(user.id))

        assert found is not None
        assert found.id == user.id
        assert found.name == user.name
        assert found.email == user.email

    async def test_get_by_email(self, repo: RelationalDBUsersRepository, user: User):
        await repo.create(user)

        found = await repo.get_by_email(Email.create(user.email))

        assert found is not None
        assert found.email == user.email

    async def test_get_by_id_returns_none_when_not_found(
        self, repo: RelationalDBUsersRepository
    ):
        found = await repo.get_by_id(Id.create())

        assert found is None

    async def test_get_by_email_returns_none_when_not_found(
        self, repo: RelationalDBUsersRepository
    ):
        found = await repo.get_by_email(Email.create("notfound@example.com"))

        assert found is None

    async def test_update(self, repo: RelationalDBUsersRepository, user: User):
        await repo.create(user)

        updated_user = User.create(
            UserData(
                id=user.id,
                name="New Name",
                email=user.email,
                password=user.hashed_password,
            )
        )
        await repo.update(updated_user)

        found = await repo.get_by_id(Id.create(user.id))
        assert found is not None
        assert found.name == "new name"

    async def test_delete(self, repo: RelationalDBUsersRepository, user: User):
        await repo.create(user)

        await repo.delete(Id.create(user.id))

        found = await repo.get_by_id(Id.create(user.id))
        assert found is None
