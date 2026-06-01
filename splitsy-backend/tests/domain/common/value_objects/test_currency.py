import pytest

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Currency


class TestCurrency:
    @pytest.mark.parametrize(
        "value",
        [
            "USD",
            "ARS",
            "EUR",
        ],
    )
    def test_valid_codes(self, value: str):
        currency = Currency.create(value)
        assert currency.value == value

    @pytest.mark.parametrize(
        "value",
        [
            1,
            True,
            {},
            [],
        ],
    )
    def test_only_strings_are_allowed(self, value):
        with pytest.raises(ValidationError):
            Currency.create(value)

    def test_lowercase_rejected(self):
        with pytest.raises(ValidationError):
            Currency.create("usd")

    def test_too_short_rejected(self):
        with pytest.raises(ValidationError):
            Currency.create("US")

    def test_too_long_rejected(self):
        with pytest.raises(ValidationError):
            Currency.create("USDT")

    def test_non_alphabetic_rejected(self):
        with pytest.raises(ValidationError):
            Currency.create("U$D")

    def test_empty_string_rejected(self):
        with pytest.raises(ValidationError):
            Currency.create("")
