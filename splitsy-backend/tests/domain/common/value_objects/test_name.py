import pytest

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Name


class TestName:
    @pytest.mark.parametrize(
        "value",
        [
            "Al",
            "Nico",
            "John Doe",
            "Élodie",
        ],
    )
    def test_valid_cases(self, value: str):
        name = Name.create(value)
        lowercase_name = value.lower()
        assert name.value == lowercase_name

    @pytest.mark.parametrize(
        "value",
        [
            1,
            True,
            {},
            [],
        ],
    )
    def test_only_strings_are_allowed(self, value: str):
        with pytest.raises(ValidationError):
            Name.create(value)

    def test_min_characters(self):
        with pytest.raises(ValidationError):
            Name.create("a")
