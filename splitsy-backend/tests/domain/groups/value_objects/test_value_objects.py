import pytest

from src.domain.common.errors import ValidationError
from src.domain.groups.value_objects import DisplayName


class TestDisplayName:
    def test_preserves_casing(self):
        assert DisplayName.create("Alice").value == "Alice"

    def test_preserves_unicode_casing(self):
        assert DisplayName.create("João Silva").value == "João Silva"

    def test_preserves_mixed_case(self):
        assert DisplayName.create("María García").value == "María García"

    def test_strips_not_applied_to_stored_value(self):
        assert DisplayName.create("Bob").value == "Bob"

    def test_too_short_raises(self):
        with pytest.raises(ValidationError):
            DisplayName.create("A")

    def test_whitespace_only_too_short_raises(self):
        with pytest.raises(ValidationError):
            DisplayName.create(" ")

    def test_minimum_length_passes(self):
        assert DisplayName.create("Al").value == "Al"
