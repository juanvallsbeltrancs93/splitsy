from uuid import uuid4

import pytest

from src.domain.common.value_objects import Id
from src.domain.groups.entities import Participant, ParticipantData
from src.domain.groups.enumerations import ParticipantType
from src.domain.groups.errors import (
    LastParticipantCannotLeaveError,
    NotGroupOwnerError,
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
        participant_id = str(uuid4())

        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="REGISTERED", user_id=user_id, id=participant_id
                ),
                ParticipantData(display_name=alias_name, type="NON_REGISTERED"),
            ],
            owner_id=participant_id,
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
            ],
            owner_id=participant_id,
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
        participant_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="REGISTERED", user_id=user_id, id=participant_id
                ),
            ],
            owner_id=participant_id,
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

    def test_add_participant_with_same_name_as_inactive_is_allowed(self):
        participant_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="NON_REGISTERED", id=participant_id
                ),
            ],
            owner_id=participant_id,
        )
        group._deactivate_participant(Id.create(participant_id))

        new_alice = Participant.create_non_registered(display_name="Alice")
        group.add_participant(new_alice)

        active = [p for p in group.participants if p.is_active]
        assert len(active) == 1
        assert active[0].display_name == "Alice"

    def test_add_registered_participant_with_same_user_id_as_inactive_is_allowed(self):
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
            ],
            owner_id=participant_id,
        )
        group._deactivate_participant(Id.create(participant_id))

        new_participant = Participant.create_registered(
            user_id=user_id, display_name="Alice New"
        )
        group.add_participant(new_participant)

        active = [p for p in group.participants if p.is_active]
        assert len(active) == 1
        assert active[0].user_id == user_id

    def test_remove_participant_success(self):
        participant_id = str(uuid4())
        other_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="NON_REGISTERED", id=participant_id
                ),
                ParticipantData(display_name="Bob", type="NON_REGISTERED", id=other_id),
            ],
            owner_id=participant_id,
        )

        group._deactivate_participant(Id.create(participant_id))

        assert len(group.participants) == 2
        removed = next(p for p in group.participants if p.id == participant_id)
        assert removed.is_active is False

    def test_remove_participant_marks_inactive_not_removes_from_list(self):
        participant_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="NON_REGISTERED", id=participant_id
                ),
            ],
            owner_id=participant_id,
        )

        group._deactivate_participant(Id.create(participant_id))

        assert len(group.participants) == 1
        assert group.participants[0].is_active is False

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
            group._deactivate_participant(unexistent)

    def test_remove_already_inactive_participant_raises_not_found(self):
        participant_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="NON_REGISTERED", id=participant_id
                ),
            ],
            owner_id=participant_id,
        )
        group._deactivate_participant(Id.create(participant_id))

        with pytest.raises(ParticipantNotFoundInGroupError):
            group._deactivate_participant(Id.create(participant_id))

    def test_active_participants_returns_only_active(self):
        active_id = str(uuid4())
        inactive_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(
                    display_name="Alice", type="NON_REGISTERED", id=active_id
                ),
                ParticipantData(
                    display_name="Bob", type="NON_REGISTERED", id=inactive_id
                ),
            ],
            owner_id=active_id,
        )
        group._deactivate_participant(Id.create(inactive_id))

        active = group.active_participants
        assert len(active) == 1
        assert active[0].id == active_id


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
            ],
            owner_id=participant_id,
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
            ],
            owner_id=alias_id,
        )

        with pytest.raises(ParticipantAlreadyClaimedError):
            group.claim_participant(Id.create(alias_id), claiming_user_id)

    def test_claim_success_mutates_participant(self):
        alias_id = str(uuid4())
        claiming_user_id = "550e8400-e29b-41d4-a716-446655440002"
        group = GroupMother.create(
            participants=[
                ParticipantData(display_name="Bob", type="NON_REGISTERED", id=alias_id),
            ],
            owner_id=alias_id,
        )

        group.claim_participant(Id.create(alias_id), claiming_user_id)

        claimed = next(p for p in group.participants if p.id == alias_id)
        assert claimed.type == ParticipantType.REGISTERED
        assert claimed.user_id == claiming_user_id

    def test_claim_inactive_participant_raises_not_found(self):
        alias_id = str(uuid4())
        group = GroupMother.create(
            participants=[
                ParticipantData(display_name="Bob", type="NON_REGISTERED", id=alias_id),
            ],
            owner_id=alias_id,
        )
        group._deactivate_participant(Id.create(alias_id))

        with pytest.raises(ParticipantNotFoundInGroupError):
            group.claim_participant(
                Id.create(alias_id), "550e8400-e29b-41d4-a716-446655440002"
            )


class TestRemoveParticipantOwnerGuard:
    def test_non_owner_cannot_remove_participant_raises(self):
        owner_user_id = str(uuid4())
        other_user_id = str(uuid4())
        owner_participant_id = str(uuid4())
        other_participant_id = str(uuid4())
        group = GroupMother.create(
            owner_id=owner_participant_id,
            participants=[
                ParticipantData(
                    display_name="Owner",
                    type="REGISTERED",
                    user_id=owner_user_id,
                    id=owner_participant_id,
                ),
                ParticipantData(
                    display_name="Other",
                    type="REGISTERED",
                    user_id=other_user_id,
                    id=other_participant_id,
                ),
            ],
        )

        with pytest.raises(NotGroupOwnerError):
            group.remove_participant(
                Id.create(owner_participant_id), requester_id=other_user_id
            )

    def test_owner_can_remove_other_participant(self):
        owner_user_id = str(uuid4())
        other_participant_id = str(uuid4())
        owner_participant_id = str(uuid4())
        group = GroupMother.create(
            owner_id=owner_participant_id,
            participants=[
                ParticipantData(
                    display_name="Owner",
                    type="REGISTERED",
                    user_id=owner_user_id,
                    id=owner_participant_id,
                ),
                ParticipantData(
                    display_name="Bob",
                    type="NON_REGISTERED",
                    id=other_participant_id,
                ),
            ],
        )

        group.remove_participant(
            Id.create(other_participant_id), requester_id=owner_user_id
        )

        removed = next(p for p in group.participants if p.id == other_participant_id)
        assert removed.is_active is False

    def test_owner_removes_themselves_transfers_ownership(self):
        owner_user_id = str(uuid4())
        owner_participant_id = str(uuid4())
        next_participant_id = str(uuid4())
        group = GroupMother.create(
            owner_id=owner_participant_id,
            participants=[
                ParticipantData(
                    display_name="Owner",
                    type="REGISTERED",
                    user_id=owner_user_id,
                    id=owner_participant_id,
                ),
                ParticipantData(
                    display_name="Next",
                    type="NON_REGISTERED",
                    id=next_participant_id,
                ),
            ],
        )

        group.remove_participant(
            Id.create(owner_participant_id), requester_id=owner_user_id
        )

        assert group.owner_id == next_participant_id
        removed = next(p for p in group.participants if p.id == owner_participant_id)
        assert removed.is_active is False

    def test_last_participant_cannot_leave_raises(self):
        owner_user_id = str(uuid4())
        owner_participant_id = str(uuid4())
        group = GroupMother.create(
            owner_id=owner_participant_id,
            participants=[
                ParticipantData(
                    display_name="Owner",
                    type="REGISTERED",
                    user_id=owner_user_id,
                    id=owner_participant_id,
                ),
            ],
        )

        with pytest.raises(LastParticipantCannotLeaveError):
            group.remove_participant(
                Id.create(owner_participant_id), requester_id=owner_user_id
            )

    def test_requester_not_in_group_raises_not_owner(self):
        owner_participant_id = str(uuid4())
        target_participant_id = str(uuid4())
        stranger_user_id = str(uuid4())
        group = GroupMother.create(
            owner_id=owner_participant_id,
            participants=[
                ParticipantData(
                    display_name="Owner",
                    type="NON_REGISTERED",
                    id=owner_participant_id,
                ),
                ParticipantData(
                    display_name="Target",
                    type="NON_REGISTERED",
                    id=target_participant_id,
                ),
            ],
        )

        with pytest.raises(NotGroupOwnerError):
            group.remove_participant(
                Id.create(target_participant_id), requester_id=stranger_user_id
            )


    def test_non_owner_can_remove_themselves(self):
        owner_user_id = str(uuid4())
        other_user_id = str(uuid4())
        owner_participant_id = str(uuid4())
        other_participant_id = str(uuid4())
        group = GroupMother.create(
            owner_id=owner_participant_id,
            participants=[
                ParticipantData(
                    display_name="Owner",
                    type="REGISTERED",
                    user_id=owner_user_id,
                    id=owner_participant_id,
                ),
                ParticipantData(
                    display_name="Other",
                    type="REGISTERED",
                    user_id=other_user_id,
                    id=other_participant_id,
                ),
            ],
        )

        group.remove_participant(
            Id.create(other_participant_id), requester_id=other_user_id
        )

        removed = next(p for p in group.participants if p.id == other_participant_id)
        assert removed.is_active is False
        # Owner should not change
        assert group.owner_id == owner_participant_id

    def test_is_owner_returns_true_for_owner(self):
        owner_user_id = str(uuid4())
        owner_participant_id = str(uuid4())
        group = GroupMother.create_with_registered_owner(
            owner_user_id=owner_user_id,
            owner_participant_id=owner_participant_id,
        )

        assert group.is_owner(owner_user_id) is True

    def test_is_owner_returns_false_for_non_owner(self):
        owner_user_id = str(uuid4())
        other_user_id = str(uuid4())
        group = GroupMother.create_with_registered_owner(owner_user_id=owner_user_id)

        assert group.is_owner(other_user_id) is False
