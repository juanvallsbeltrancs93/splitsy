from src.domain.common.errors import NotFoundError


class UserNotFoundError(NotFoundError):
    """Raised when user is not found."""


class UserAlreadyExistsError(Exception):
    """Raised when a user with the same email already exists."""


class InvalidCredentialsError(Exception):
    """Raised when authentication credentials are invalid."""
