from src.domain.common.errors import NotFoundError


class SettlementNotFoundError(NotFoundError):
    """Raised when a settlement is not found."""


class AlreadyExistsSettlementError(Exception):
    """Raised when a settlement already exists."""
