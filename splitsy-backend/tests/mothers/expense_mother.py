from datetime import datetime, timezone
from decimal import Decimal

from src.domain.expenses.entities.expense import Expense, ExpenseData, SplitData


class ExpenseMother:
    _DEFAULT_NAME = "Dinner"
    _DEFAULT_AMOUNT = Decimal("50.00")
    _DEFAULT_DATE = datetime(2026, 1, 15, 20, 0, 0, tzinfo=timezone.utc)
    _DEFAULT_GROUP_ID = "660e8400-e29b-41d4-a716-446655440000"
    _DEFAULT_PAID_BY = "550e8400-e29b-41d4-a716-446655440000"
    _DEFAULT_SPLITS = [
        SplitData(
            participant_id="550e8400-e29b-41d4-a716-446655440000",
            amount=Decimal("50.00"),
        )
    ]
    _DEFAULT_ID = "770e8400-e29b-41d4-a716-446655440000"

    @staticmethod
    def create(**overrides) -> Expense:
        data = ExpenseData(
            name=overrides.get("name", ExpenseMother._DEFAULT_NAME),
            amount=overrides.get("amount", ExpenseMother._DEFAULT_AMOUNT),
            date=overrides.get("date", ExpenseMother._DEFAULT_DATE),
            group_id=overrides.get("group_id", ExpenseMother._DEFAULT_GROUP_ID),
            paid_by=overrides.get("paid_by", ExpenseMother._DEFAULT_PAID_BY),
            splits=overrides.get("splits", ExpenseMother._DEFAULT_SPLITS),
            description=overrides.get("description", None),
            id=overrides.get("id", ExpenseMother._DEFAULT_ID),
        )
        return Expense.create(data)

    @staticmethod
    def with_description() -> Expense:
        return Expense.create(
            ExpenseData(
                name=ExpenseMother._DEFAULT_NAME,
                amount=ExpenseMother._DEFAULT_AMOUNT,
                date=ExpenseMother._DEFAULT_DATE,
                group_id=ExpenseMother._DEFAULT_GROUP_ID,
                paid_by=ExpenseMother._DEFAULT_PAID_BY,
                splits=ExpenseMother._DEFAULT_SPLITS,
                description="Shared dinner at the restaurant",
                id=ExpenseMother._DEFAULT_ID,
            )
        )
