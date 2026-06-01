from src.domain.common.errors import NotFoundError


class AlreadyExistsGroupError(Exception):
    """Raised when a group with the same identity already exists."""


class GroupNotFoundError(NotFoundError):
    """Raised when the requested group does not exist."""


class ParticipantAlreadyInGroupError(Exception):
    """Raised when a participant is already a member of the group."""


class ParticipantNotFoundInGroupError(NotFoundError):
    """Raised when the referenced participant does not belong to the group."""


class ParticipantNotAliasError(Exception):
    """Raised when trying to claim a participant that is already REGISTERED."""


class ParticipantAlreadyClaimedError(Exception):
    """Raised when the user already has a REGISTERED participant in this group."""


class ParticipantNameAlreadyInGroupError(Exception):
    """Raised when a participant with the same display name already exists in the group."""


class NotGroupOwnerError(Exception):
    """Raised when a user attempts an owner-only operation without being the group owner."""


class LastParticipantCannotLeaveError(Exception):
    """Raised when the last active participant tries to leave the group."""
