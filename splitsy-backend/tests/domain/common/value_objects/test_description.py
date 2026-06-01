import pytest

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Description


class TestDescription:
    def test_valid_description(self):
        description = Description.create("Shared dinner")

        assert description.value == "Shared dinner"

    def test_min_length(self):
        with pytest.raises(ValidationError):
            Description.create("")

    def test_max_length(self):
        with pytest.raises(ValidationError):
            Description.create("a" * 281)

    @pytest.mark.parametrize(
        "value",
        [
            123,
            None,
            [],
        ],
    )
    def test_invalid_type(self, value):
        with pytest.raises(ValidationError):
            Description.create(value)
