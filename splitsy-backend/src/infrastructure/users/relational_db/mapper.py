from __future__ import annotations

from src.domain.users.entities.user import User, UserData
from src.infrastructure.common.mapper import Mapper
from src.infrastructure.users.relational_db.orm import UserORM


class UserMapper(Mapper[User, UserORM]):
    def to_entity(self, orm_model: UserORM) -> User:
        return User.create(
            UserData(
                id=orm_model.id,
                name=orm_model.name,
                password=orm_model.password,
                email=orm_model.email,
            )
        )

    def to_orm(self, entity: User) -> UserORM:
        return UserORM(
            id=entity.id,
            name=entity.name,
            email=entity.email,
            password=entity.hashed_password,
        )
