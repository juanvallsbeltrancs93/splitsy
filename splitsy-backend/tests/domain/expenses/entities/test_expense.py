from datetime import datetime, timezone
from decimal import Decimal

import pytest

from src.domain.common.errors import ValidationError
from src.domain.common.value_objects import Id
from src.domain.expenses.entities.expense import ExpenseData, SplitData
from tests.mothers import ExpenseMother


class TestExpenseEntity:
    def test_should_create_expense_successfully(self):
        expense = ExpenseMother.create()

        assert expense.id is not None
        assert expense.name == "Dinner"
        assert expense.amount == Decimal("50.00")
        assert expense.date == datetime(2026, 1, 15, 20, 0, 0, tzinfo=timezone.utc)
        assert expense.description is None
        assert expense.group_id == "660e8400-e29b-41d4-a716-446655440000"
        assert expense.paid_by == "550e8400-e29b-41d4-a716-446655440000"
        assert expense.splits == [
            {
                "participant_id": "550e8400-e29b-41d4-a716-446655440000",
                "amount": Decimal("50.00"),
            }
        ]
        assert hasattr(expense, "_splits")

    def test_create_without_id_should_generate_one(self):
        expense = ExpenseMother.create(id=None)

        assert expense.id is not None
        assert isinstance(expense.id, str)

    def test_should_raise_validation_error_on_missing_splits(self):
        with pytest.raises(ValidationError):
            ExpenseMother.create(splits=[])

    def test_should_raise_validation_error_when_splits_do_not_sum_to_amount(self):
        with pytest.raises(
            ValidationError,
            match="Splits total",
        ):
            ExpenseMother.create(
                amount=Decimal("100.00"),
                splits=[
                    SplitData(participant_id=Id.create().value, amount=Decimal("60.00")),
                    SplitData(participant_id=Id.create().value, amount=Decimal("20.00")),
                ],
            )

    def test_should_allow_splits_within_rounding_tolerance_without_adjusting(self):
        p1 = Id.create().value
        p2 = Id.create().value
        p3 = Id.create().value

        expense = ExpenseMother.create(
            amount=Decimal("10.00"),
            splits=[
                SplitData(participant_id=p1, amount=Decimal("3.33")),
                SplitData(participant_id=p2, amount=Decimal("3.33")),
                SplitData(participant_id=p3, amount=Decimal("3.33")),
            ],
        )

        assert expense.amount == Decimal("10.00")
        assert len(expense.splits) == 3
        assert expense.splits[0]["amount"] == Decimal("3.33")
        assert expense.splits[1]["amount"] == Decimal("3.33")
        assert expense.splits[2]["amount"] == Decimal("3.33")
        assert expense.splits[2]["participant_id"] == p3
        assert sum(s["amount"] for s in expense.splits) == Decimal("9.99")  # type: ignore

    @pytest.mark.parametrize(
        "invalid_data",
        [
            ExpenseData(
                name="Hotel",
                amount=Decimal("-0.01"),
                date=datetime(2024, 1, 3, tzinfo=timezone.utc),
                group_id=Id.create().value,
                paid_by=Id.create().value,
                splits=[SplitData(participant_id=Id.create().value, amount=Decimal("0"))],
            ),
            ExpenseData(
                name="Invalid",
                amount=Decimal("-10"),
                date=datetime(2024, 1, 3, tzinfo=timezone.utc),
                group_id=Id.create().value,
                paid_by=Id.create().value,
                splits=[SplitData(participant_id=Id.create().value, amount=Decimal("-10"))],
            ),
        ],
    )
    def test_should_raise_validation_error_on_invalid_amount(self, invalid_data):
        with pytest.raises(ValidationError):
            ExpenseMother.create(
                amount=invalid_data.amount,
                splits=invalid_data.splits,
            )

    def test_to_dict(self):
        expense = ExpenseMother.create(id="00089ea4-d892-4af9-b465-20827d6541a4")

        expense_dict = expense.to_dict()

        assert expense_dict == {
            "id": "00089ea4-d892-4af9-b465-20827d6541a4",
            "name": "Dinner",
            "amount": Decimal("50.00"),
            "date": datetime(2026, 1, 15, 20, 0, 0, tzinfo=timezone.utc),
            "group_id": "660e8400-e29b-41d4-a716-446655440000",
            "paid_by": "550e8400-e29b-41d4-a716-446655440000",
            "splits": [
                {
                    "participant_id": "550e8400-e29b-41d4-a716-446655440000",
                    "amount": Decimal("50.00"),
                }
            ],
            "description": None,
        }

    def test_equality_between_expenses(self):
        id_1 = Id.create().value
        id_2 = Id.create().value

        expense1 = ExpenseMother.create(id=id_1)
        expense2 = ExpenseMother.create(name="Different", id=id_1)
        expense3 = ExpenseMother.create(id=id_2)

        assert expense1 == expense2
        assert expense1 != expense3
        assert expense1 != "not-an-expense-object"

    def test_apply_to_balances_credits_payer_and_debits_each_split(self):
        from collections import defaultdict

        payer = "550e8400-e29b-41d4-a716-446655440000"
        other = "440e8400-e29b-41d4-a716-446655440000"

        expense = ExpenseMother.create(
            amount=Decimal("60.00"),
            paid_by=payer,
            splits=[
                SplitData(participant_id=payer, amount=Decimal("30.00")),
                SplitData(participant_id=other, amount=Decimal("30.00")),
            ],
        )

        balances: dict[str, Decimal] = defaultdict(Decimal)
        expense.apply_to_balances(balances)

        # payer paid 60, owes 30 → net +30
        assert balances[payer] == Decimal("30.00")
        # other paid nothing, owes 30 → net -30
        assert balances[other] == Decimal("-30.00")

    def test_apply_to_balances_accumulates_on_existing_values(self):
        from collections import defaultdict

        payer = "550e8400-e29b-41d4-a716-446655440000"

        expense = ExpenseMother.create(
            amount=Decimal("50.00"),
            paid_by=payer,
            splits=[SplitData(participant_id=payer, amount=Decimal("50.00"))],
        )

        balances: dict[str, Decimal] = defaultdict(Decimal)
        balances[payer] = Decimal("10.00")
        expense.apply_to_balances(balances)

        # pre-existing 10 + paid 50 - owes 50 = net +10
        assert balances[payer] == Decimal("10.00")
