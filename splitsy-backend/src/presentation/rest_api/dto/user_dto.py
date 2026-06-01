from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class UserRegisterDTO(BaseModel):
    """Request body for user registration."""

    name: str = Field(
        ..., min_length=1, max_length=100, description="Full name", example="Alice Doe"
    )
    email: EmailStr = Field(
        ..., description="Email address", example="alice@example.com"
    )
    password: str = Field(
        ...,
        min_length=8,
        description="Password (min 8 characters)",
        example="secret123",
    )


class UserResponseDTO(BaseModel):
    """User representation returned in responses."""

    id: str
    name: str
    email: str

    @classmethod
    def from_entity(cls, user) -> UserResponseDTO:
        return cls(id=user.id, name=user.name, email=user.email)


class TokenResponseDTO(BaseModel):
    """JWT token response after login."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequestDTO(BaseModel):
    """Request body for refreshing an access token."""

    refresh_token: str
