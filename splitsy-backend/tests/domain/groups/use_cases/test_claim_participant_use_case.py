from unittest.mock import AsyncMock, create_autospec
from uuid import uuid4

import pytest

from src.domain.groups.enumerations import ParticipantType
from src.domain.groups.errors import (
    GroupNotFoundError,
    ParticipantAlreadyClaimedError,
    ParticipantNotAliasError,
    ParticipantNotFoundInGroupError,
)
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases.claim_participant_use_case import (
    ClaimParticipantUseCase,
)
from tests.mothers import GroupMother
from src.domain.groups.entities.participant import ParticipantData


GROUP_ID = "660e8400-e29b-41d4-a716-446655440001"
USER_ID = "550e8400-e29b-41d4-a716-446655440002"


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


class TestClaimParticipantUseCase:
    async def test_happy_path_claims_alias_and_saves_group(
        self, groups_repository: AsyncMock
    ):
        alias_id = str(uuid4())
        group = GroupMother.create(
            id=GROUP_ID,
            participants=[
                ParticipantData(display_name="Bob", type="NON_REGISTERED", id=alias_id)
            ],
        )
        groups_repository.get_by_id.return_value = group

        use_case = ClaimParticipantUseCase(groups_repository)
        result = await use_case(
            group_id=GROUP_ID, participant_id=alias_id, user_id=USER_ID
        )

        groups_repository.update.assert_awaited_once_with(group)
        claimed = next(p for p in result.participants if p.id == alias_id)
        assert claimed.type == ParticipantType.REGISTERED
        assert claimed.user_id == USER_ID

    async def test_group_not_found_raises_group_not_found_error(
        self, groups_repository: AsyncMock
    ):
        groups_repository.get_by_id.return_value = None

        use_case = ClaimParticipantUseCase(groups_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case(
                group_id=GROUP_ID, participant_id=str(uuid4()), user_id=USER_ID
            )

        groups_repository.update.assert_not_awaited()

    async def test_participant_not_found_bubbles_error(
        self, groups_repository: AsyncMock
    ):
        group = GroupMother.create(id=GROUP_ID, participants=[])
        groups_repository.get_by_id.return_value = group

        use_case = ClaimParticipantUseCase(groups_repository)

        with pytest.raises(ParticipantNotFoundInGroupError):
            await use_case(
                group_id=GROUP_ID, participant_id=str(uuid4()), user_id=USER_ID
            )

        groups_repository.update.assert_not_awaited()

    async def test_participant_already_registered_bubbles_error(
        self, groups_repository: AsyncMock
    ):
        registered_id = str(uuid4())
        group = GroupMother.create(
            id=GROUP_ID,
            participants=[
                ParticipantData(
                    display_name="Alice",
                    type="REGISTERED",
                    user_id=str(uuid4()),
                    id=registered_id,
                ),
            ],
        )
        groups_repository.get_by_id.return_value = group

        use_case = ClaimParticipantUseCase(groups_repository)

        with pytest.raises(ParticipantNotAliasError):
            await use_case(
                group_id=GROUP_ID, participant_id=registered_id, user_id=USER_ID
            )

        groups_repository.update.assert_not_awaited()

    async def test_user_already_in_group_bubbles_error(
        self, groups_repository: AsyncMock
    ):
        alias_id = str(uuid4())
        group = GroupMother.create(
            id=GROUP_ID,
            participants=[
                ParticipantData(
                    display_name="Alias", type="NON_REGISTERED", id=alias_id
                ),
                ParticipantData(
                    display_name="Alice",
                    type="REGISTERED",
                    user_id=USER_ID,
                    id=str(uuid4()),
                ),
            ],
        )
        groups_repository.get_by_id.return_value = group

        use_case = ClaimParticipantUseCase(groups_repository)

        with pytest.raises(ParticipantAlreadyClaimedError):
            await use_case(group_id=GROUP_ID, participant_id=alias_id, user_id=USER_ID)

        groups_repository.update.assert_not_awaited()
