from typing import Annotated

from fastapi import APIRouter, Depends

from src.domain.users.entities.user import User
from src.presentation.rest_api.dependencies import get_current_user
from src.presentation.rest_api.dto.user_dto import UserResponseDTO

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponseDTO,
    summary="Get current user",
    description=(
        "Return the profile of the currently authenticated user. "
        "Requires a valid Bearer token."
    ),
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponseDTO:
    return UserResponseDTO.from_entity(current_user)
