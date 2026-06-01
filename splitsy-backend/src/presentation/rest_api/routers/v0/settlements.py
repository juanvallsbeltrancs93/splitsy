from typing import Annotated

from fastapi import APIRouter, Depends

from src.domain.settlements.entities.settlement import SettlementData
from src.domain.settlements.use_cases.create_settlement_use_case import (
    CreateSettlementUseCase,
)
from src.domain.settlements.use_cases.get_group_settlements_use_case import (
    GetGroupSettlementsUseCase,
)
from src.domain.users.entities.user import User
from src.presentation.rest_api.dependencies import (
    get_create_settlement_use_case,
    get_current_user,
    get_get_group_settlements_use_case,
)
from src.presentation.rest_api.dto.settlement_dto import (
    SettlementCreateDTO,
    SettlementResponseDTO,
)

router = APIRouter(prefix="/settlements", tags=["Settlements"])


@router.post(
    "/group/{group_id}",
    response_model=SettlementResponseDTO,
    status_code=201,
    summary="Create settlement",
    description=(
        "Record a payment settlement between two participants in a group. "
        "This reduces the debt between from_user_id and to_user_id."
    ),
)
async def create_settlement(
    group_id: str,
    body: SettlementCreateDTO,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[
        CreateSettlementUseCase, Depends(get_create_settlement_use_case)
    ],
) -> SettlementResponseDTO:
    settlement = await use_case(
        SettlementData(
            group_id=group_id,
            from_participant_id=body.from_participant_id,
            to_participant_id=body.to_participant_id,
            amount=body.amount,
            date=body.date,
            note=body.note,
        )
    )
    return SettlementResponseDTO.from_entity(settlement)


@router.get(
    "/group/{group_id}",
    response_model=list[SettlementResponseDTO],
    summary="List group settlements",
    description="Return all settlements recorded for a given group.",
)
async def list_group_settlements(
    group_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    use_case: Annotated[
        GetGroupSettlementsUseCase, Depends(get_get_group_settlements_use_case)
    ],
) -> list[SettlementResponseDTO]:
    settlements = await use_case(group_id)
    return [SettlementResponseDTO.from_entity(s) for s in settlements]
