from decimal import Decimal

import pytest

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Amount


class TestAmount:
    def test_valid_amount(self):
        amount = Amount.create(Decimal("10.50"))

        assert amount.value == Decimal("10.50")

    @pytest.mark.parametrize(
        ("value", "expected"),
        [
            (Decimal("9.3333333333"), Decimal("9.33")),
            (Decimal("10.235"), Decimal("10.23")),
            (Decimal("10.234"), Decimal("10.23")),
            (Decimal("0"), Decimal("0.00")),
        ],
    )
    def test_amount_truncates_to_two_decimals(self, value: Decimal, expected: Decimal):
        amount = Amount.create(value)

        assert amount.value == expected

    @pytest.mark.parametrize(
        "value",
        [
            Decimal("-1"),
            Decimal("-0.01"),
        ],
    )
    def test_invalid_amount_value(self, value: Decimal):
        with pytest.raises(ValidationError):
            Amount.create(value)

    @pytest.mark.parametrize(
        "value",
        [
            "10",
            10,
            None,
        ],
    )
    def test_invalid_amount_type(self, value):
        with pytest.raises(ValidationError):
            Amount.create(value)
