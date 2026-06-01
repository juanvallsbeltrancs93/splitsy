from unittest.mock import AsyncMock, MagicMock, call, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.expenses.repositories import ExpensesRepository
from src.domain.groups.entities import Group
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases import DeleteGroupUseCase
from src.domain.settlements.repositories import SettlementsRepository
from tests.mothers import GroupMother


@pytest.fixture
def groups_repo() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


@pytest.fixture
def expenses_repo() -> AsyncMock:
    return create_autospec(ExpensesRepository, instance=True)


@pytest.fixture
def settlements_repo() -> AsyncMock:
    return create_autospec(SettlementsRepository, instance=True)


@pytest.fixture
def group() -> Group:
    return GroupMother.create()


class TestDeleteGroupUseCase:
    async def test_deletes_expenses_settlements_and_group(
        self,
        groups_repo: AsyncMock,
        expenses_repo: AsyncMock,
        settlements_repo: AsyncMock,
        group: Group,
    ):
        groups_repo.get_by_id.return_value = group

        parent = MagicMock()
        parent.attach_mock(expenses_repo.delete_by_group_id, "expenses_delete")
        parent.attach_mock(settlements_repo.delete_by_group_id, "settlements_delete")
        parent.attach_mock(groups_repo.delete, "group_delete")

        group_id = Id.create(group.id)
        use_case = DeleteGroupUseCase(groups_repo, expenses_repo, settlements_repo)
        await use_case(group_id)

        parent.assert_has_calls(
            [
                call.expenses_delete(group_id),
                call.settlements_delete(group_id),
                call.group_delete(group_id),
            ]
        )

    async def test_raises_group_not_found_when_group_does_not_exist(
        self,
        groups_repo: AsyncMock,
        expenses_repo: AsyncMock,
        settlements_repo: AsyncMock,
    ):
        groups_repo.get_by_id.return_value = None

        use_case = DeleteGroupUseCase(groups_repo, expenses_repo, settlements_repo)

        with pytest.raises(GroupNotFoundError):
            await use_case(Id.create())

    async def test_does_not_delete_when_group_not_found(
        self,
        groups_repo: AsyncMock,
        expenses_repo: AsyncMock,
        settlements_repo: AsyncMock,
    ):
        groups_repo.get_by_id.return_value = None

        use_case = DeleteGroupUseCase(groups_repo, expenses_repo, settlements_repo)

        with pytest.raises(GroupNotFoundError):
            await use_case(Id.create())

        expenses_repo.delete_by_group_id.assert_not_awaited()
        groups_repo.delete.assert_not_awaited()
