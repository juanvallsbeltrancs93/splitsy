from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.expenses.use_cases import ListGroupExpensesUseCase
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from tests.mothers import ExpenseMother, GroupMother


@pytest.fixture
def expenses_repository() -> AsyncMock:
    return create_autospec(ExpensesRepository, instance=True)


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


class TestListGroupExpensesUseCase:
    async def test_should_return_expenses_for_group(
        self, expenses_repository: AsyncMock, groups_repository: AsyncMock
    ):
        group = GroupMother.create()
        expense1 = ExpenseMother.create(group_id=group.id)
        expense2 = ExpenseMother.create(id=None, group_id=group.id)

        groups_repository.get_by_id.return_value = group
        expenses_repository.get_by_group_id.return_value = [expense1, expense2]

        use_case = ListGroupExpensesUseCase(expenses_repository, groups_repository)
        result = await use_case(group.id)

        expenses_repository.get_by_group_id.assert_awaited_once_with(
            Id.create(group.id)
        )
        assert len(result) == 2

    async def test_should_return_empty_list_when_no_expenses(
        self, expenses_repository: AsyncMock, groups_repository: AsyncMock
    ):
        group = GroupMother.create()
        groups_repository.get_by_id.return_value = group
        expenses_repository.get_by_group_id.return_value = []

        use_case = ListGroupExpensesUseCase(expenses_repository, groups_repository)
        result = await use_case(group.id)

        assert result == []

    async def test_should_raise_when_group_not_found(
        self, expenses_repository: AsyncMock, groups_repository: AsyncMock
    ):
        groups_repository.get_by_id.return_value = None
        missing_id = Id.create().value

        use_case = ListGroupExpensesUseCase(expenses_repository, groups_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case(missing_id)
