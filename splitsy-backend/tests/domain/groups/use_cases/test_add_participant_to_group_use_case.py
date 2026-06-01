from unittest.mock import AsyncMock, create_autospec

import pytest

from src.domain.groups.entities.participant import ParticipantData
from src.domain.groups.enumerations import ParticipantType
from src.domain.groups.errors import (
    GroupNotFoundError,
    ParticipantAlreadyInGroupError,
    ParticipantNameAlreadyInGroupError,
)
from src.domain.groups.repositories import GroupsRepository
from src.domain.groups.use_cases.add_participant_to_group_use_case import (
    AddParticipantToGroupUseCase,
)
from src.domain.users.errors import UserNotFoundError
from src.domain.users.repositories import UsersRepository
from tests.mothers import GroupMother, UserMother

USER_ID = "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee"


@pytest.fixture
def groups_repository() -> AsyncMock:
    return create_autospec(GroupsRepository, instance=True)


@pytest.fixture
def users_repository() -> AsyncMock:
    return create_autospec(UsersRepository, instance=True)


class TestAddParticipantToGroupUseCase:
    async def test_registered_path_adds_participant_with_correct_type_and_display_name(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        user = UserMother.create(id=USER_ID, name="Bob")
        group = GroupMother.create(participants=[])
        users_repository.get_by_id.return_value = user
        groups_repository.get_by_id.return_value = group

        use_case = AddParticipantToGroupUseCase(groups_repository, users_repository)
        result = await use_case(
            group_id=group.id, participant_type="REGISTERED", user_id=USER_ID
        )

        groups_repository.update.assert_awaited_once_with(group)
        assert result is group
        assert len(result.participants) == 1
        p = result.participants[0]
        assert p.type == ParticipantType.REGISTERED
        assert p.user_id == USER_ID
        assert p.display_name == user.name

    async def test_alias_path_adds_participant_with_none_user_id(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        group = GroupMother.create(participants=[])
        groups_repository.get_by_id.return_value = group

        use_case = AddParticipantToGroupUseCase(groups_repository, users_repository)
        result = await use_case(
            group_id=group.id, participant_type="NON_REGISTERED", display_name="Charlie"
        )

        groups_repository.update.assert_awaited_once_with(group)
        assert result is group
        p = result.participants[0]
        assert p.type == ParticipantType.NON_REGISTERED
        assert p.user_id is None
        assert p.display_name == "Charlie"

    async def test_registered_user_already_in_group_raises_error(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        user = UserMother.create(id=USER_ID, name="Bob")
        group = GroupMother.create(
            participants=[
                ParticipantData(display_name="Bob", type="REGISTERED", user_id=USER_ID)
            ]
        )
        users_repository.get_by_id.return_value = user
        groups_repository.get_by_id.return_value = group

        use_case = AddParticipantToGroupUseCase(groups_repository, users_repository)

        with pytest.raises(ParticipantNameAlreadyInGroupError):
            await use_case(
                group_id=group.id, participant_type="REGISTERED", user_id=USER_ID
            )

        groups_repository.update.assert_not_awaited()

    async def test_registered_user_already_in_group_different_name_raises_error(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        user = UserMother.create(id=USER_ID, name="Bob")
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="REGISTERED", user_id=USER_ID
                )
            ]
        )
        users_repository.get_by_id.return_value = user
        groups_repository.get_by_id.return_value = group

        use_case = AddParticipantToGroupUseCase(groups_repository, users_repository)

        with pytest.raises(ParticipantAlreadyInGroupError):
            await use_case(
                group_id=group.id, participant_type="REGISTERED", user_id=USER_ID
            )

        groups_repository.update.assert_not_awaited()

    async def test_registered_user_not_found_raises_error(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        users_repository.get_by_id.return_value = None

        use_case = AddParticipantToGroupUseCase(groups_repository, users_repository)

        with pytest.raises(UserNotFoundError):
            await use_case(
                group_id="660e8400-e29b-41d4-a716-446655440001",
                participant_type="REGISTERED",
                user_id=USER_ID,
            )

        groups_repository.update.assert_not_awaited()

    async def test_group_not_found_raises_error(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        user = UserMother.create(id=USER_ID)
        users_repository.get_by_id.return_value = user
        groups_repository.get_by_id.return_value = None

        use_case = AddParticipantToGroupUseCase(groups_repository, users_repository)

        with pytest.raises(GroupNotFoundError):
            await use_case(
                group_id="660e8400-e29b-41d4-a716-446655440001",
                participant_type="REGISTERED",
                user_id=USER_ID,
            )

        groups_repository.update.assert_not_awaited()

    async def test_participant_with_same_display_name_raises_error(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        group = GroupMother.create(
            participants=[
                ParticipantData(display_name="Charlie", type="NON_REGISTERED")
            ]
        )
        groups_repository.get_by_id.return_value = group

        use_case = AddParticipantToGroupUseCase(groups_repository, users_repository)

        with pytest.raises(ParticipantNameAlreadyInGroupError):
            await use_case(
                group_id=group.id,
                participant_type="NON_REGISTERED",
                display_name="Charlie",
            )

        groups_repository.update.assert_not_awaited()

    async def test_participant_with_same_display_name_different_case_raises_error(
        self,
        groups_repository: AsyncMock,
        users_repository: AsyncMock,
    ):
        group = GroupMother.create(
            participants=[
                ParticipantData(display_name="Charlie", type="NON_REGISTERED")
            ]
        )
        groups_repository.get_by_id.return_value = group

        use_case = AddParticipantToGroupUseCase(groups_repository, users_repository)

        with pytest.raises(ParticipantNameAlreadyInGroupError):
            await use_case(
                group_id=group.id,
                participant_type="NON_REGISTERED",
                display_name="charlie",
            )

        groups_repository.update.assert_not_awaited()
