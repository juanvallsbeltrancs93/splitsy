import pytest
from freezegun import freeze_time

from src.infrastructure.auth.jwt_token_service import (
    JWTTokenService,
    TokenValidationError,
)


@pytest.fixture
def token_service() -> JWTTokenService:
    return JWTTokenService(
        secret_key="test_secret",
        algorithm="HS256",
        expire_minutes=15,
        refresh_expire_days=7,
    )


class TestCreateAccessToken:
    def test_returns_non_empty_string(self, token_service: JWTTokenService):
        token = token_service.create_access_token("user_123")

        assert isinstance(token, str)
        assert len(token) > 0


class TestVerifyAccessToken:
    def test_returns_correct_subject(self, token_service: JWTTokenService):
        token = token_service.create_access_token("user_123")

        subject = token_service.verify_access_token(token)

        assert subject == "user_123"

    def test_raises_validation_error_for_invalid_token(
        self, token_service: JWTTokenService
    ):
        with pytest.raises(TokenValidationError):
            token_service.verify_access_token("invalid_token")

    def test_raises_validation_error_for_expired_token(
        self, token_service: JWTTokenService
    ):
        with freeze_time("2024-01-01 00:00:00"):
            token = token_service.create_access_token("user_123")

        with freeze_time("2024-01-01 01:00:00"):
            with pytest.raises(TokenValidationError):
                token_service.verify_access_token(token)


class TestCreateRefreshToken:
    def test_returns_non_empty_string(self, token_service: JWTTokenService):
        token = token_service.create_refresh_token("user_123")

        assert isinstance(token, str)
        assert len(token) > 0


class TestVerifyRefreshToken:
    def test_returns_correct_subject(self, token_service: JWTTokenService):
        token = token_service.create_refresh_token("user_123")

        subject = token_service.verify_refresh_token(token)

        assert subject == "user_123"

    def test_raises_validation_error_for_access_token(
        self, token_service: JWTTokenService
    ):
        access_token = token_service.create_access_token("user_123")

        with pytest.raises(TokenValidationError):
            token_service.verify_refresh_token(access_token)

    def test_raises_validation_error_for_invalid_token(
        self, token_service: JWTTokenService
    ):
        with pytest.raises(TokenValidationError):
            token_service.verify_refresh_token("invalid_token")

    def test_raises_validation_error_for_expired_token(
        self, token_service: JWTTokenService
    ):
        with freeze_time("2024-01-01 00:00:00"):
            token = token_service.create_refresh_token("user_123")

        with freeze_time("2024-01-08 01:00:00"):
            with pytest.raises(TokenValidationError):
                token_service.verify_refresh_token(token)
