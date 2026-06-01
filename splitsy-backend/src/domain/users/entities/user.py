from dataclasses import dataclass

from src.domain.common.entities import Entity
from src.domain.common.value_objects import Id
from src.domain.users.value_objects import Email, Name, Password


@dataclass(frozen=True)
class UserData:
    name: str
    password: str
    email: str
    id: str | None = None


@dataclass()
class UserEntityData:
    id: Id
    name: Name
    password: Password
    email: Email


class User(Entity[UserEntityData]):
    def __init__(self, data: UserEntityData) -> None:
        super().__init__(id=data.id, data=data)
        self._name = data.name
        self._password = data.password
        self._email = data.email

    @property
    def name(self) -> str:
        return self._name.value

    @property
    def email(self) -> str:
        return self._email.value

    @property
    def hashed_password(self) -> str:
        return self._password.get_secret_value()

    @staticmethod
    def create(data: UserData) -> "User":
        entity_data = UserEntityData(
            id=Id.create(data.id),
            name=Name.create(data.name),
            password=Password.create(data.password),
            email=Email.create(data.email),
        )

        return User(entity_data)
