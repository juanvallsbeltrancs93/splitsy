from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases import ListUserGroupsUseCase
from tests.mothers import GroupMother


@pytest.fixture
def repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


class TestListUserGroupsUseCase:
    async def test_calls_list_by_participant_with_id_and_returns_groups(
        self, repository: AsyncMock
    ):
        user_id = Id.create().value
        expected = [GroupMother.create(), GroupMother.create(id=Id.create().value)]
        repository.list_by_participant.return_value = expected

        use_case = ListUserGroupsUseCase(repository)
        result = await use_case(user_id=user_id)

        repository.list_by_participant.assert_awaited_once_with(Id.create(user_id))
        assert result == expected
        assert isinstance(result, list)
        assert all(isinstance(g, Group) for g in result)
