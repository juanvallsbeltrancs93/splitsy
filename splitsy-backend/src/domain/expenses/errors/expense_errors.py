from src.domain.common.errors import NotFoundError


class ExpenseNotFoundError(NotFoundError):
    """Raised when the requested expense does not exist."""


class AlreadyExistsExpenseError(Exception):
    """Raised when an expense with the same identity already exists."""


class InvalidParticipantError(Exception):
    """Raised when a participant referenced in an expense is not valid."""
