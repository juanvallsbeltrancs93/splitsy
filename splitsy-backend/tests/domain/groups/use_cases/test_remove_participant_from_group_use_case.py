from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.groups.entities.participant import ParticipantData
from src.domain.groups.errors import (
    GroupNotFoundError,
    NotGroupOwnerError,
    ParticipantNotFoundInGroupError,
)
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases.remove_participant_from_group_use_case import (
    RemoveParticipantFromGroupUseCase,
)
from tests.mothers import GroupMother

PARTICIPANT_ID = "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee"
OWNER_USER_ID = "11111111-2222-4333-8444-555555555555"
OWNER_PARTICIPANT_ID = "22222222-3333-4444-5555-666666666666"
NON_OWNER_USER_ID = "99999999-aaaa-4bbb-cccc-dddddddddddd"
NON_OWNER_PARTICIPANT_ID = "eeeeeeee-ffff-4000-a000-111111111111"


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


class TestRemoveParticipantFromGroupUseCase:
    async def test_removes_participant_by_id_and_saves_group(
        self,
        groups_repository: AsyncMock,
    ):
        group = GroupMother.create_with_registered_owner(
            owner_user_id=OWNER_USER_ID,
            owner_participant_id=OWNER_PARTICIPANT_ID,
            extra_participants=[
                ParticipantData(
                    id=PARTICIPANT_ID,
                    display_name="Alice",
                    type="NON_REGISTERED",
                )
            ],
        )
        groups_repository.get_by_id.return_value = group

        use_case = RemoveParticipantFromGroupUseCase(groups_repository)
        result = await use_case(
            group_id=group.id, participant_id=PARTICIPANT_ID, requester_id=OWNER_USER_ID
        )

        groups_repository.update.assert_awaited_once_with(group)
        assert result is group
        alice = next(p for p in result.participants if p.id == PARTICIPANT_ID)
        assert alice.is_active is False

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
                requester_id=OWNER_USER_ID,
            )

        groups_repository.update.assert_not_awaited()

    async def test_participant_not_found_in_group_raises_error(
        self,
        groups_repository: AsyncMock,
    ):
        group = GroupMother.create_with_registered_owner(owner_user_id=OWNER_USER_ID)
        groups_repository.get_by_id.return_value = group

        use_case = RemoveParticipantFromGroupUseCase(groups_repository)

        with pytest.raises(ParticipantNotFoundInGroupError):
            await use_case(
                group_id=group.id,
                participant_id=PARTICIPANT_ID,
                requester_id=OWNER_USER_ID,
            )

        groups_repository.update.assert_not_awaited()

    async def test_non_owner_raises_not_group_owner_error(
        self,
        groups_repository: AsyncMock,
    ):
        group = GroupMother.create_with_registered_owner(
            owner_user_id=OWNER_USER_ID,
            owner_participant_id=OWNER_PARTICIPANT_ID,
            extra_participants=[
                ParticipantData(
                    id=PARTICIPANT_ID,
                    display_name="Alice",
                    type="NON_REGISTERED",
                )
            ],
        )
        groups_repository.get_by_id.return_value = group

        use_case = RemoveParticipantFromGroupUseCase(groups_repository)

        with pytest.raises(NotGroupOwnerError):
            await use_case(
                group_id=group.id,
                participant_id=PARTICIPANT_ID,
                requester_id=NON_OWNER_USER_ID,
            )

        groups_repository.update.assert_not_awaited()

    async def test_non_owner_can_remove_themselves(
        self,
        groups_repository: AsyncMock,
    ):
        group = GroupMother.create_with_registered_owner(
            owner_user_id=OWNER_USER_ID,
            owner_participant_id=OWNER_PARTICIPANT_ID,
            extra_participants=[
                ParticipantData(
                    id=NON_OWNER_PARTICIPANT_ID,
                    display_name="Ana",
                    type="REGISTERED",
                    user_id=NON_OWNER_USER_ID,
                )
            ],
        )
        groups_repository.get_by_id.return_value = group

        use_case = RemoveParticipantFromGroupUseCase(groups_repository)
        result = await use_case(
            group_id=group.id,
            participant_id=NON_OWNER_PARTICIPANT_ID,
            requester_id=NON_OWNER_USER_ID,
        )

        groups_repository.update.assert_awaited_once_with(group)
        ana = next(p for p in result.participants if p.id == NON_OWNER_PARTICIPANT_ID)
        assert ana.is_active is False

