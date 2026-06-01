from src.domain.users.entities import User
from src.domain.users.entities.user import UserData


class UserMother:
    _DEFAULT_NAME = "Nicolas"
    _DEFAULT_EMAIL = "nicolas@example.com"
    _DEFAULT_PASSWORD = "Password123!"
    _DEFAULT_ID = "550e8400-e29b-41d4-a716-446655440000"

    @staticmethod
    def create(**overrides) -> User:
        data = UserData(
            name=overrides.get("name", UserMother._DEFAULT_NAME),
            email=overrides.get("email", UserMother._DEFAULT_EMAIL),
            password=overrides.get("password", UserMother._DEFAULT_PASSWORD),
            id=overrides.get("id", UserMother._DEFAULT_ID),
        )
        return User.create(data)

    @staticmethod
    def admin() -> User:
        return User.create(
            UserData(
                name="Admin",
                email="admin@splitsy.com",
                password="AdminPass123!",
                id="aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
            )
        )
