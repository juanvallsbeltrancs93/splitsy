import pytest

from src.domain.common.errors import ValidationError
from src.domain.groups.entities import Participant
from src.domain.groups.enumerations import ParticipantType

_USER_ID = "550e8400-e29b-41d4-a716-446655440001"


class TestParticipantEntity:
    def test_create_registered_has_uuid_id(self):
        participant = Participant.create_registered(user_id=_USER_ID, display_name="Alice")

        assert participant.id is not None
        assert isinstance(participant.id, str)

    def test_create_registered_preserves_display_name_casing(self):
        participant = Participant.create_registered(user_id=_USER_ID, display_name="João Silva")

        assert participant.display_name == "João Silva"

    def test_create_registered_type(self):
        participant = Participant.create_registered(user_id=_USER_ID, display_name="Alice")

        assert participant.type == ParticipantType.REGISTERED

    def test_create_registered_type_normalized_to_uppercase(self):
        from src.domain.groups.entities.participant import ParticipantData
        participant = Participant.create(ParticipantData(display_name="Alice", type="registered", user_id=_USER_ID))

        assert participant.type == ParticipantType.REGISTERED

    def test_create_registered_user_id(self):
        participant = Participant.create_registered(user_id=_USER_ID, display_name="Alice")

        assert participant.user_id == _USER_ID

    def test_create_non_registered_has_uuid_id(self):
        participant = Participant.create_non_registered(display_name="Bob")

        assert participant.id is not None
        assert isinstance(participant.id, str)

    def test_create_non_registered_preserves_display_name_casing(self):
        participant = Participant.create_non_registered(display_name="María García")

        assert participant.display_name == "María García"

    def test_create_non_registered_type(self):
        participant = Participant.create_non_registered(display_name="Bob")

        assert participant.type == ParticipantType.NON_REGISTERED

    def test_create_non_registered_user_id_is_none(self):
        participant = Participant.create_non_registered(display_name="Bob")

        assert participant.user_id is None

    def test_is_registered_returns_true_for_registered(self):
        participant = Participant.create_registered(user_id=_USER_ID, display_name="Alice")

        assert participant.is_registered() is True

    def test_is_registered_returns_false_for_non_registered(self):
        participant = Participant.create_non_registered(display_name="Bob")

        assert participant.is_registered() is False

    def test_display_name_too_short_raises(self):
        with pytest.raises(ValidationError):
            Participant.create_non_registered(display_name="A")

    def test_invalid_type_raises(self):
        from src.domain.groups.entities.participant import ParticipantData
        with pytest.raises(ValueError):
            Participant.create(ParticipantData(display_name="Alice", type="UNKNOWN"))

    def test_claim_changes_type_to_registered(self):
        participant = Participant.create_non_registered(display_name="Bob")
        user_id = "550e8400-e29b-41d4-a716-446655440002"

        participant.claim(user_id)

        assert participant.type == ParticipantType.REGISTERED

    def test_claim_sets_user_id(self):
        participant = Participant.create_non_registered(display_name="Bob")
        user_id = "550e8400-e29b-41d4-a716-446655440002"

        participant.claim(user_id)

        assert participant.user_id == user_id
