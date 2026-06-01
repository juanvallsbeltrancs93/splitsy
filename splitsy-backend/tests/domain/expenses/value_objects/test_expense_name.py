import pytest

from src.domain.common.errors import ValidationError
from src.domain.expenses.value_objects import Name


class TestExpenseName:
    @pytest.mark.parametrize(
        "value",
        [
            "Trip dinner",
            "Coffee",
            "Élodie",
        ],
    )
    def test_valid_cases(self, value: str):
        name = Name.create(value)

        assert name.value == value

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
            Name.create("")

    def test_max_characters(self):
        with pytest.raises(ValidationError):
            Name.create("a" * 101)
