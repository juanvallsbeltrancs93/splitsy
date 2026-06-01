from decimal import Decimal
from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.expenses.entities import Expense
from src.domain.expenses.entities.expense import ExpenseData, SplitData
from src.domain.expenses.errors import InvalidParticipantError
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.expenses.use_cases import CreateExpenseUseCase
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from tests.mothers import GroupMother


@pytest.fixture
def expenses_repository() -> AsyncMock:
    return create_autospec(ExpensesRepository, instance=True)


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


class TestCreateExpenseUseCase:
    async def test_should_create_expense_successfully(
        self, expenses_repository: AsyncMock, groups_repository: AsyncMock
    ):
        group = GroupMother.create()
        groups_repository.get_by_id.return_value = group

        from datetime import datetime, timezone

        expense_data = ExpenseData(
            name="Dinner",
            amount=Decimal("60.00"),
            date=datetime(2026, 1, 15, tzinfo=timezone.utc),
            group_id=group.id,
            paid_by="550e8400-e29b-41d4-a716-446655440000",
            splits=[
                SplitData(
                    participant_id="550e8400-e29b-41d4-a716-446655440000",
                    amount=Decimal("60.00"),
                )
            ],
        )

        use_case = CreateExpenseUseCase(expenses_repository, groups_repository)
        result = await use_case(expense_data)

        expenses_repository.create.assert_awaited_once()
        assert isinstance(result, Expense)
        assert result.name == "Dinner"

    async def test_should_raise_when_group_not_found(
        self, expenses_repository: AsyncMock, groups_repository: AsyncMock
    ):
        groups_repository.get_by_id.return_value = None
        missing_group_id = Id.create().value

        from datetime import datetime, timezone

        expense_data = ExpenseData(
            name="Dinner",
            amount=Decimal("60.00"),
            date=datetime(2026, 1, 15, tzinfo=timezone.utc),
            group_id=missing_group_id,
            paid_by="550e8400-e29b-41d4-a716-446655440000",
            splits=[
                SplitData(
                    participant_id="550e8400-e29b-41d4-a716-446655440000",
                    amount=Decimal("60.00"),
                )
            ],
        )

        use_case = CreateExpenseUseCase(expenses_repository, groups_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case(expense_data)

    async def test_should_not_persist_when_group_not_found(
        self, expenses_repository: AsyncMock, groups_repository: AsyncMock
    ):
        groups_repository.get_by_id.return_value = None
        missing_group_id = Id.create().value

        from datetime import datetime, timezone

        expense_data = ExpenseData(
            name="Dinner",
            amount=Decimal("60.00"),
            date=datetime(2026, 1, 15, tzinfo=timezone.utc),
            group_id=missing_group_id,
            paid_by="550e8400-e29b-41d4-a716-446655440000",
            splits=[
                SplitData(
                    participant_id="550e8400-e29b-41d4-a716-446655440000",
                    amount=Decimal("60.00"),
                )
            ],
        )

        use_case = CreateExpenseUseCase(expenses_repository, groups_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case(expense_data)

        expenses_repository.create.assert_not_awaited()

    async def test_create_expense_raises_when_paid_by_not_in_group(
        self, expenses_repository: AsyncMock, groups_repository: AsyncMock
    ):
        group = GroupMother.create()
        groups_repository.get_by_id.return_value = group

        from datetime import datetime, timezone

        expense_data = ExpenseData(
            name="Dinner",
            amount=Decimal("60.00"),
            date=datetime(2026, 1, 15, tzinfo=timezone.utc),
            group_id=group.id,
            paid_by="00000000-0000-4000-a000-000000000099",
            splits=[
                SplitData(
                    participant_id="550e8400-e29b-41d4-a716-446655440000",
                    amount=Decimal("60.00"),
                )
            ],
        )

        use_case = CreateExpenseUseCase(expenses_repository, groups_repository)

        with pytest.raises(InvalidParticipantError):
            await use_case(expense_data)

        expenses_repository.create.assert_not_awaited()

    async def test_create_expense_raises_when_split_participant_not_in_group(
        self, expenses_repository: AsyncMock, groups_repository: AsyncMock
    ):
        group = GroupMother.create()
        groups_repository.get_by_id.return_value = group

        from datetime import datetime, timezone

        expense_data = ExpenseData(
            name="Dinner",
            amount=Decimal("60.00"),
            date=datetime(2026, 1, 15, tzinfo=timezone.utc),
            group_id=group.id,
            paid_by="550e8400-e29b-41d4-a716-446655440000",
            splits=[
                SplitData(
                    participant_id="00000000-0000-4000-a000-000000000099",
                    amount=Decimal("60.00"),
                )
            ],
        )

        use_case = CreateExpenseUseCase(expenses_repository, groups_repository)

        with pytest.raises(InvalidParticipantError):
            await use_case(expense_data)
