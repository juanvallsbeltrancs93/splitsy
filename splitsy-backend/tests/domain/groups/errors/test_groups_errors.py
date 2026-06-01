import pytest

from src.domain.groups.errors import (
    ParticipantAlreadyInGroupError,
    ParticipantNotAliasError,
    ParticipantNotFoundInGroupError,
)
from src.domain.common.errors import NotFoundError


class TestNewGroupErrors:
    def test_participant_not_found_is_importable_and_raisable(self):
        with pytest.raises(ParticipantNotFoundInGroupError):
            raise ParticipantNotFoundInGroupError("p123 not in group")

    def test_participant_not_found_is_not_found_error(self):
        exc = ParticipantNotFoundInGroupError("x")
        assert isinstance(exc, NotFoundError)

    def test_participant_not_alias_is_importable_and_raisable(self):
        with pytest.raises(ParticipantNotAliasError):
            raise ParticipantNotAliasError("participant is REGISTERED")

    def test_participant_already_in_group_is_importable_and_raisable(self):
        with pytest.raises(ParticipantAlreadyInGroupError):
            raise ParticipantAlreadyInGroupError("participant already in group")
