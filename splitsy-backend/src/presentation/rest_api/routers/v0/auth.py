from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from src.domain.users.entities.user import UserData
from src.domain.users.use_cases.authenticate_user_use_case import (
    AuthenticateUserUseCase,
)
from src.domain.users.use_cases.register_user_use_case import RegisterUserUseCase
from src.infrastructure.auth.jwt_token_service import JWTTokenService
from src.presentation.rest_api.dependencies import (
    get_authenticate_use_case,
    get_register_use_case,
    get_token_service,
)
from src.presentation.rest_api.dto.user_dto import (
    RefreshTokenRequestDTO,
    TokenResponseDTO,
    UserRegisterDTO,
    UserResponseDTO,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/token",
    response_model=TokenResponseDTO,
    summary="Login",
    description=(
        "Authenticate with email and password using OAuth2 password flow. "
        "Returns a JWT access token and a refresh token."
    ),
)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    use_case: Annotated[AuthenticateUserUseCase, Depends(get_authenticate_use_case)],
    token_service: Annotated[JWTTokenService, Depends(get_token_service)],
) -> TokenResponseDTO:
    user = await use_case(email=form_data.username, password=form_data.password)
    access_token = token_service.create_access_token(subject=user.id)
    refresh_token = token_service.create_refresh_token(subject=user.id)

    return TokenResponseDTO(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/refresh",
    response_model=TokenResponseDTO,
    summary="Refresh token",
    description=(
        "Exchange a valid refresh token for a new access token and a new refresh token. "
        "The old refresh token is invalidated by rotation."
    ),
)
async def refresh(
    body: RefreshTokenRequestDTO,
    token_service: Annotated[JWTTokenService, Depends(get_token_service)],
) -> TokenResponseDTO:
    user_id = token_service.verify_refresh_token(body.refresh_token)
    access_token = token_service.create_access_token(subject=user_id)
    refresh_token = token_service.create_refresh_token(subject=user_id)

    return TokenResponseDTO(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/register",
    response_model=UserResponseDTO,
    status_code=201,
    summary="Register user",
    description=(
        "Create a new user account. "
        "Returns the created user's profile (id, name, email)."
    ),
)
async def register(
    body: UserRegisterDTO,
    use_case: Annotated[RegisterUserUseCase, Depends(get_register_use_case)],
) -> UserResponseDTO:
    user = await use_case(
        UserData(name=body.name, email=body.email, password=body.password)
    )

    return UserResponseDTO.from_entity(user)
