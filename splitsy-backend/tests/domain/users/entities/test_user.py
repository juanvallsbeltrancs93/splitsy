import pytest

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Id
from src.domain.users.entities.user import UserData
from src.domain.users.value_objects import Password
from tests.mothers import UserMother


class TestUserEntity:
    def test_should_create_user_successfully(self):
        user = UserMother.create()

        assert user.id is not None
        assert user.name == "nicolas"
        assert user.email == "nicolas@example.com"
        assert hasattr(user, "_password")

    def test_create_without_id_should_generate_one(self):
        user = UserMother.create(id=None)

        assert user.id is not None
        assert isinstance(user.id, str)

    @pytest.mark.parametrize(
        "invalid_data",
        [
            UserData(name="a", email="test@test.com", password="Pass123!"),
            UserData(name="Nico", email="invalid-email", password="Pass123!"),
            UserData(name="Nico", email="test@test.com", password="123"),
        ],
    )
    def test_should_raise_validation_error_on_invalid_data(
        self, invalid_data: UserData
    ):
        with pytest.raises(ValidationError):
            UserMother.create(
                name=invalid_data.name,
                email=invalid_data.email,
                password=invalid_data.password,
            )

    def test_to_dict(self):
        user = UserMother.create(id="00089ea4-d892-4af9-b465-20827d6541a4")

        user_dict = user.to_dict()

        assert user_dict == {
            "id": "00089ea4-d892-4af9-b465-20827d6541a4",
            "name": "nicolas",
            "email": "nicolas@example.com",
            "password": Password.create("Password123!"),
        }

    def test_equality_between_users(self):
        id_1 = Id.create().value
        id_2 = Id.create().value

        user1 = UserMother.create(id=id_1)
        user2 = UserMother.create(name="Other", email="b@b.com", id=id_1)
        user3 = UserMother.create(id=id_2)

        assert user1 == user2
        assert user1 != user3
        assert user1 != "not-a-user-object"
