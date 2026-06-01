from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.groups.entities.participant import ParticipantData
from src.domain.groups.errors import GroupNotFoundError, ParticipantNotFoundInGroupError
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases.remove_participant_from_group_use_case import (
    RemoveParticipantFromGroupUseCase,
)
from tests.mothers import GroupMother

PARTICIPANT_ID = "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee"


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


class TestRemoveParticipantFromGroupUseCase:
    async def test_removes_participant_by_id_and_saves_group(
        self,
        groups_repository: AsyncMock,
    ):
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    id=PARTICIPANT_ID,
                    display_name="Alice",
                    type="NON_REGISTERED",
                )
            ]
        )
        participant_id = group.participants[0].id
        groups_repository.get_by_id.return_value = group

        use_case = RemoveParticipantFromGroupUseCase(groups_repository)
        result = await use_case(group_id=group.id, participant_id=participant_id)

        groups_repository.update.assert_awaited_once_with(group)
        assert result is group
        assert len(result.participants) == 0

    async def test_group_not_found_raises_error(
        self,
        groups_repository: AsyncMock,
    ):
        groups_repository.get_by_id.return_value = None

        use_case = RemoveParticipantFromGroupUseCase(groups_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case(
                group_id="660e8400-e29b-41d4-a716-446655440001",
                participant_id=PARTICIPANT_ID,
            )

        groups_repository.update.assert_not_awaited()

    async def test_participant_not_found_in_group_raises_error(
        self,
        groups_repository: AsyncMock,
    ):
        group = GroupMother.create(participants=[])
        groups_repository.get_by_id.return_value = group

        use_case = RemoveParticipantFromGroupUseCase(groups_repository)

        with pytest.raises(ParticipantNotFoundInGroupError):
            await use_case(group_id=group.id, participant_id=PARTICIPANT_ID)

        groups_repository.update.assert_not_awaited()
