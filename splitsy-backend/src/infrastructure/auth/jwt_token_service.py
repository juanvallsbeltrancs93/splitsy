from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from jwt import PyJWTError


class TokenValidationError(Exception):
    """Raised when a JWT token cannot be verified."""


class JWTTokenService:
    def __init__(
        self,
        secret_key: str,
        algorithm: str,
        expire_minutes: int,
        refresh_expire_days: int = 7,
    ) -> None:
        self._secret_key = secret_key
        self._algorithm = algorithm
        self._expire_minutes = expire_minutes
        self._refresh_expire_days = refresh_expire_days

    def create_access_token(self, subject: str) -> str:
        expire = datetime.now(UTC) + timedelta(minutes=self._expire_minutes)
        payload = {"sub": subject, "exp": expire}
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def verify_access_token(self, token: str) -> str:
        try:
            payload: dict[str, Any] = jwt.decode(
                token, self._secret_key, algorithms=[self._algorithm]
            )
            subject: str | None = payload.get("sub")
            if subject is None:
                raise TokenValidationError("Token has no subject.")
            return subject
        except PyJWTError as error:
            raise TokenValidationError(str(error)) from error

    def create_refresh_token(self, subject: str) -> str:
        expire = datetime.now(UTC) + timedelta(days=self._refresh_expire_days)
        payload = {"sub": subject, "exp": expire, "type": "refresh"}
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def verify_refresh_token(self, token: str) -> str:
        try:
            payload: dict[str, Any] = jwt.decode(
                token, self._secret_key, algorithms=[self._algorithm]
            )
            subject: str | None = payload.get("sub")
            if subject is None:
                raise TokenValidationError("Token has no subject.")
            if payload.get("type") != "refresh":
                raise TokenValidationError("Token is not a refresh token.")
            return subject
        except PyJWTError as error:
            raise TokenValidationError(str(error)) from error
