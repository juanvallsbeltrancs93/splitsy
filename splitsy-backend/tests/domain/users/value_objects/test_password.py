import pytest

from src.domain.common.errors import ValidationError
from src.domain.users.value_objects import Password


class TestPassword:
    @pytest.mark.parametrize(
        "value",
        [
            "Abcdef1!",
            "StrongP@ssw0rd",
            "Z9!aaaaa",
        ],
    )
    def test_valid_cases(self, value: str):
        password = Password.create(value)

        assert password.get_secret_value() == value

    @pytest.mark.parametrize(
        "value",
        [
            "Abcdef1!",
            "StrongP@ssw0rd",
            "Z9!aaaaa",
        ],
    )
    def test_repr(self, value: str):
        password = Password.create(value)

        assert repr(password) == "Password(<hidden>)"
        assert str(password) == "<hidden>"

    @pytest.mark.parametrize(
        "value",
        [
            "short1!",
            "alllowercase1!",
            "ALLUPPERCASE1!",
            "NoNumber!",
            "NoSpecial1",
            "12345678!",
        ],
    )
    def test_regex_dont_match(self, value: str):
        with pytest.raises(ValidationError):
            Password.create(value)

    @pytest.mark.parametrize(
        "value",
        [123456, True, {"alllowercase1"}, [], {}],
    )
    def test_invalid_type(self, value: str):
        with pytest.raises(ValidationError):
            Password.create(value)
