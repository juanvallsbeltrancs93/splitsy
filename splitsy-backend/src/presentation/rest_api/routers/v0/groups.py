from typing import Annotated

from fastapi import APIRouter, Depends, Response

from src.domain.common.value_objects import Id
from src.domain.groups.use_cases.add_participant_to_group_use_case import (
    AddParticipantToGroupUseCase,
)
from src.domain.groups.use_cases.claim_participant_use_case import (
    ClaimParticipantUseCase,
)
from src.domain.groups.use_cases.create_group_use_case import CreateGroupUseCase
from src.domain.groups.use_cases.delete_group_use_case import DeleteGroupUseCase
from src.domain.groups.use_cases.get_group_balances_use_case import (
    GetGroupBalancesUseCase,
)
from src.domain.groups.use_cases.get_group_use_case import GetGroupUseCase
from src.domain.groups.use_cases.list_user_groups_use_case import ListUserGroupsUseCase
from src.domain.groups.use_cases.remove_participant_from_group_use_case import (
    RemoveParticipantFromGroupUseCase,
)
from src.domain.groups.use_cases.update_group_name_use_case import (
    UpdateGroupNameUseCase,
)
from src.domain.users.entities.user import User
from src.presentation.rest_api.dependencies import (
    get_add_participant_to_group_use_case,
    get_claim_participant_use_case,
    get_create_group_use_case,
    get_current_user,
    get_delete_group_use_case,
    get_get_group_balances_use_case,
    get_get_group_use_case,
    get_list_user_groups_use_case,
    get_remove_participant_from_group_use_case,
    get_update_group_name_use_case,
)
from src.presentation.rest_api.dto.group_dto import (
    AddParticipantDTO,
    GroupCreateDTO,
    GroupResponseDTO,
    ParticipantBalanceDTO,
    UpdateGroupNameDTO,
)

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get("", response_model=list[GroupResponseDTO])
async def list_user_groups(
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[ListUserGroupsUseCase, Depends(get_list_user_groups_use_case)],
) -> list[GroupResponseDTO]:
    groups = await use_case(user_id=current_user.id)
    return [GroupResponseDTO.from_entity(g) for g in groups]


@router.post(
    "",
    response_model=GroupResponseDTO,
    status_code=201,
    summary="Create group",
    description=(
        "Create a new expense group. "
        "The authenticated user is automatically added as the first participant."
    ),
)
async def create_group(
    body: GroupCreateDTO,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[CreateGroupUseCase, Depends(get_create_group_use_case)],
) -> GroupResponseDTO:
    group = await use_case(
        name=body.name,
        creator_id=current_user.id,
        aliases=body.aliases,
        currency=body.currency,
    )
    return GroupResponseDTO.from_entity(group)


@router.get(
    "/{group_id}",
    response_model=GroupResponseDTO,
    summary="Get group",
    description="Return the details of a group by its ID, including all participants.",
)
async def get_group(
    group_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[GetGroupUseCase, Depends(get_get_group_use_case)],
) -> GroupResponseDTO:
    group = await use_case(group_id)
    return GroupResponseDTO.from_entity(group)


@router.post(
    "/{group_id}/participants",
    response_model=GroupResponseDTO,
    summary="Add participant to group",
    description="Add a registered user or alias participant to the group.",
)
async def add_participant(
    group_id: str,
    body: AddParticipantDTO,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[
        AddParticipantToGroupUseCase, Depends(get_add_participant_to_group_use_case)
    ],
) -> GroupResponseDTO:
    group = await use_case(group_id, body.type, body.user_id, body.display_name)
    return GroupResponseDTO.from_entity(group)


@router.delete(
    "/{group_id}/participants/{participant_id}",
    response_model=GroupResponseDTO,
    summary="Remove participant from group",
    description="Remove a participant from the group by their participant UUID.",
)
async def remove_participant(
    group_id: str,
    participant_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[
        RemoveParticipantFromGroupUseCase,
        Depends(get_remove_participant_from_group_use_case),
    ],
) -> GroupResponseDTO:
    group = await use_case(group_id, participant_id, requester_id=current_user.id)
    return GroupResponseDTO.from_entity(group)


@router.get(
    "/{group_id}/balances",
    response_model=list[ParticipantBalanceDTO],
    summary="Get group balances",
    description=(
        "Calculate and return the net balance for each participant in the group. "
        "A positive balance means the participant is owed money; negative means they owe money."
    ),
)
async def get_balances(
    group_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[
        GetGroupBalancesUseCase, Depends(get_get_group_balances_use_case)
    ],
) -> list[ParticipantBalanceDTO]:
    balances = await use_case(group_id)
    return [ParticipantBalanceDTO.from_domain(b) for b in balances]


@router.patch(
    "/{group_id}",
    response_model=GroupResponseDTO,
    summary="Update group name",
)
async def update_group_name(
    group_id: str,
    body: UpdateGroupNameDTO,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[
        UpdateGroupNameUseCase, Depends(get_update_group_name_use_case)
    ],
) -> GroupResponseDTO:
    group = await use_case(Id.create(group_id), body.name)
    return GroupResponseDTO.from_entity(group)


@router.delete(
    "/{group_id}",
    status_code=204,
    summary="Delete group",
)
async def delete_group(
    group_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[DeleteGroupUseCase, Depends(get_delete_group_use_case)],
) -> Response:
    await use_case(Id.create(group_id), requester_id=current_user.id)
    return Response(status_code=204)


@router.post("/{group_id}/claim/{participant_id}", response_model=GroupResponseDTO)
async def claim_participant(
    group_id: str,
    participant_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[
        ClaimParticipantUseCase, Depends(get_claim_participant_use_case)
    ],
) -> GroupResponseDTO:
    group = await use_case(
        group_id=group_id, participant_id=participant_id, user_id=current_user.id
    )
    return GroupResponseDTO.from_entity(group)
