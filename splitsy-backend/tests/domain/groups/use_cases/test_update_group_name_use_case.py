from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Group
from src.domain.groups.errors import GroupNotFoundError
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases import UpdateGroupNameUseCase
from tests.mothers import GroupMother


@pytest.fixture
def repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


@pytest.fixture
def group() -> Group:
    return GroupMother.create(name="old name")


class TestUpdateGroupNameUseCase:
    async def test_updates_group_name_and_returns_group(
        self, repository: AsyncMock, group: Group
    ):
        repository.get_by_id.return_value = group

        use_case = UpdateGroupNameUseCase(repository)
        result = await use_case(Id.create(group.id), "new name")

        assert result.name == "new name"

    async def test_preserves_existing_participants(
        self, repository: AsyncMock, group: Group
    ):
        repository.get_by_id.return_value = group

        use_case = UpdateGroupNameUseCase(repository)
        result = await use_case(Id.create(group.id), "new name")

        assert result.participants == group.participants

    async def test_normalizes_name_to_lowercase(
        self, repository: AsyncMock, group: Group
    ):
        repository.get_by_id.return_value = group

        use_case = UpdateGroupNameUseCase(repository)
        result = await use_case(Id.create(group.id), "UPPER CASE")

        assert result.name == "upper case"

    async def test_raises_group_not_found_when_group_does_not_exist(
        self, repository: AsyncMock
    ):
        repository.get_by_id.return_value = None

        use_case = UpdateGroupNameUseCase(repository)

        with pytest.raises(GroupNotFoundError):
            await use_case(Id.create(), "new name")
