from uuid import uuid4

import pytest

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Participant, ParticipantData
from src.domain.groups.enumerations import ParticipantType
from src.domain.groups.errors import (
    ParticipantAlreadyClaimedError,
    ParticipantAlreadyInGroupError,
    ParticipantNameAlreadyInGroupError,
    ParticipantNotAliasError,
    ParticipantNotFoundInGroupError,
)
from tests.mothers import GroupMother


class TestGroupEntity:
    def test_should_create_group_successfully(self):
        group = GroupMother.create()

        assert group.id is not None
        assert group.name == "splitsy group"
        assert group.currency == "USD"
        assert len(group.participants) == 1
        assert isinstance(group.participants[0], Participant)
        assert hasattr(group, "_participants")

    def test_create_with_explicit_currency(self):
        group = GroupMother.create(currency="EUR")

        assert group.currency == "EUR"

    def test_create_without_id_should_generate_one(self):
        group = GroupMother.create(id=None)

        assert group.id is not None
        assert isinstance(group.id, str)

    def test_equality_between_groups(self):
        id_1 = Id.create().value
        id_2 = Id.create().value

        group1 = GroupMother.create(id=id_1)
        group2 = GroupMother.create(name="Different Name", id=id_1)
        group3 = GroupMother.create(id=id_2)

        assert group1 == group2
        assert group1 != group3
        assert group1 != "not-a-group-object"

    def test_create_group_with_participants_returns_participant_objects(self):
        user_id = str(uuid4())
        alias_name = "Bob"

        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="REGISTERED", user_id=user_id
                ),
                ParticipantData(display_name=alias_name, type="NON_REGISTERED"),
            ]
        )

        assert len(group.participants) == 2
        assert all(isinstance(p, Participant) for p in group.participants)

    def test_exist_participant_true(self):
        participant_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="NON_REGISTERED", id=participant_id
                ),
            ]
        )

        assert group.exist_participant(Id.create(participant_id))

    def test_exist_participant_false(self):
        group = GroupMother.create(
            participants=[
                ParticipantData(display_name="Alice", type="NON_REGISTERED"),
            ]
        )
        non_existent = Id.create()

        assert group.exist_participant(non_existent) is False

    def test_add_registered_participant_success(self):
        user_id = str(uuid4())
        group = GroupMother.create(participants=[])
        new_participant = Participant.create_registered(
            user_id=user_id, display_name="Alice"
        )

        group.add_participant(new_participant)

        assert any(p.id == new_participant.id for p in group.participants)

    def test_add_registered_participant_duplicate_user_id_raises(self):
        user_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="REGISTERED", user_id=user_id
                ),
            ]
        )
        duplicate = Participant.create_registered(
            user_id=user_id, display_name="Alice 2"
        )

        with pytest.raises(ParticipantAlreadyInGroupError):
            group.add_participant(duplicate)

    def test_add_two_alias_participants_with_same_name_raises_error(self):
        group = GroupMother.create(participants=[])
        alias1 = Participant.create_non_registered(display_name="Bob")
        alias2 = Participant.create_non_registered(display_name="Bob")

        group.add_participant(alias1)

        with pytest.raises(ParticipantNameAlreadyInGroupError):
            group.add_participant(alias2)

    def test_remove_participant_success(self):
        participant_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="NON_REGISTERED", id=participant_id
                ),
                ParticipantData(display_name="Bob", type="NON_REGISTERED"),
            ]
        )

        group.remove_participant(Id.create(participant_id))

        assert not any(p.id == participant_id for p in group.participants)

    def test_remove_participant_doesnt_exist(self):
        unexistent = Id.create()
        group = GroupMother.create(
            participants=[
                ParticipantData(display_name="Alice", type="NON_REGISTERED"),
            ]
        )

        with pytest.raises(
            ParticipantNotFoundInGroupError,
            match=f"Participant {unexistent.value} not found in group.",
        ):
            group.remove_participant(unexistent)


class TestGroupClaimParticipant:
    def test_claim_participant_not_found_raises(self):
        group = GroupMother.create(participants=[])
        non_existent_id = Id.create()

        with pytest.raises(ParticipantNotFoundInGroupError):
            group.claim_participant(
                non_existent_id, "550e8400-e29b-41d4-a716-446655440002"
            )

    def test_claim_registered_participant_raises_not_alias_error(self):
        user_id = str(uuid4())
        participant_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice",
                    type="REGISTERED",
                    user_id=user_id,
                    id=participant_id,
                ),
            ]
        )

        with pytest.raises(ParticipantNotAliasError):
            group.claim_participant(
                Id.create(participant_id), "550e8400-e29b-41d4-a716-446655440002"
            )

    def test_claim_raises_when_user_already_registered_in_group(self):
        claiming_user_id = "550e8400-e29b-41d4-a716-446655440002"
        alias_id = str(uuid4())
        existing_registered_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alias", type="NON_REGISTERED", id=alias_id
                ),
                ParticipantData(
                    display_name="Existing",
                    type="REGISTERED",
                    user_id=claiming_user_id,
                    id=existing_registered_id,
                ),
            ]
        )

        with pytest.raises(ParticipantAlreadyClaimedError):
            group.claim_participant(Id.create(alias_id), claiming_user_id)

    def test_claim_success_mutates_participant(self):
        alias_id = str(uuid4())
        claiming_user_id = "550e8400-e29b-41d4-a716-446655440002"
        group = GroupMother.create(
            participants=[
                ParticipantData(display_name="Bob", type="NON_REGISTERED", id=alias_id),
            ]
        )

        group.claim_participant(Id.create(alias_id), claiming_user_id)

        claimed = next(p for p in group.participants if p.id == alias_id)
        assert claimed.type == ParticipantType.REGISTERED
        assert claimed.user_id == claiming_user_id
