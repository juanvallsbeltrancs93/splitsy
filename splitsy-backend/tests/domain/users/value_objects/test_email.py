import pytest

from src.domain.common.errors import ValidationError
from src.domain.users.value_objects import Email


class TestEmail:
    @pytest.mark.parametrize(
        "value",
        [
            "TEST@EXAMPLE.COM",
            "User.Name@Domain.io",
            "simple@example.org",
        ],
    )
    def test_valid_cases(self, value: str):
        email = Email.create(value)
        expected = value.lower()

        assert email.value == expected
        assert repr(email) == f"Email('{expected}')"

    @pytest.mark.parametrize(
        "value",
        [
            "not-an-email",
            "missing-at-symbol.com",
            "user@",
            "@domain.com",
        ],
    )
    def test_regex_dont_match(self, value: str):
        with pytest.raises(ValidationError):
            Email.create(value)

    @pytest.mark.parametrize(
        "value",
        [123456, True, {"simple@example.org"}, [], {}],
    )
    def test_invalid_type(self, value: str):
        with pytest.raises(ValidationError):
            Email.create(value)
