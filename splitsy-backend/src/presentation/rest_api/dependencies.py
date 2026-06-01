from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from src.composition_root import CompositionRoot
from src.domain.expenses.use_cases.create_expense_use_case import CreateExpenseUseCase
from src.domain.expenses.use_cases.delete_expense_use_case import DeleteExpenseUseCase
from src.domain.expenses.use_cases.get_expense_use_case import GetExpenseUseCase
from src.domain.expenses.use_cases.list_group_expenses_use_case import (
    ListGroupExpensesUseCase,
)
from src.domain.expenses.use_cases.update_expense_use_case import UpdateExpenseUseCase
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
from src.domain.settlements.use_cases.create_settlement_use_case import (
    CreateSettlementUseCase,
)
from src.domain.settlements.use_cases.get_group_settlements_use_case import (
    GetGroupSettlementsUseCase,
)
from src.domain.users.entities.user import User
from src.domain.users.use_cases.authenticate_user_use_case import (
    AuthenticateUserUseCase,
)
from src.domain.users.use_cases.register_user_use_case import RegisterUserUseCase
from src.infrastructure.auth.jwt_token_service import JWTTokenService
from src.presentation.rest_api.api_settings import get_api_settings

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=(
        f"{get_api_settings().api_base_url}"
        f"{get_api_settings().api_prefix}/v0/auth/token"
    )
)


# ── Internal helpers (not exported to routers) ────────────────────────────────


def _get_root(request: Request) -> CompositionRoot:
    return request.app.state.composition_root


async def _get_session(request: Request) -> AsyncSession:
    root = _get_root(request)
    async with root.make_session() as session:
        yield session


# ── Auth guard ────────────────────────────────────────────────────────────────


def get_token_service(request: Request) -> JWTTokenService:
    return _get_root(request).token_service


async def get_current_user(
    request: Request,
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> User:
    root = _get_root(request)
    user_id = root.token_service.verify_access_token(token)
    return await root.get_user_use_case(session)(user_id)


# ── Users ─────────────────────────────────────────────────────────────────────


async def get_register_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> RegisterUserUseCase:
    return _get_root(request).register_use_case(session)


async def get_authenticate_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> AuthenticateUserUseCase:
    return _get_root(request).authenticate_use_case(session)


# ── Groups ────────────────────────────────────────────────────────────────────


async def get_create_group_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> CreateGroupUseCase:
    return _get_root(request).create_group_use_case(session)


async def get_get_group_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> GetGroupUseCase:
    return _get_root(request).get_group_use_case(session)


async def get_get_group_balances_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> GetGroupBalancesUseCase:
    return _get_root(request).get_group_balances_use_case(session)


async def get_add_participant_to_group_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> AddParticipantToGroupUseCase:
    return _get_root(request).add_participant_to_group_use_case(session)


async def get_remove_participant_from_group_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> RemoveParticipantFromGroupUseCase:
    return _get_root(request).remove_participant_from_group_use_case(session)


async def get_update_group_name_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> UpdateGroupNameUseCase:
    return _get_root(request).update_group_name_use_case(session)


async def get_delete_group_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> DeleteGroupUseCase:
    return _get_root(request).delete_group_use_case(session)


async def get_list_user_groups_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> ListUserGroupsUseCase:
    return _get_root(request).list_user_groups_use_case(session)


async def get_claim_participant_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> ClaimParticipantUseCase:
    return _get_root(request).claim_participant_use_case(session)


# ── Expenses ──────────────────────────────────────────────────────────────────


async def get_create_expense_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> CreateExpenseUseCase:
    return _get_root(request).create_expense_use_case(session)


async def get_get_expense_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> GetExpenseUseCase:
    return _get_root(request).get_expense_use_case(session)


async def get_list_group_expenses_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> ListGroupExpensesUseCase:
    return _get_root(request).list_group_expenses_use_case(session)


async def get_update_expense_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> UpdateExpenseUseCase:
    return _get_root(request).update_expense_use_case(session)


async def get_delete_expense_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> DeleteExpenseUseCase:
    return _get_root(request).delete_expense_use_case(session)


# ── Settlements ───────────────────────────────────────────────────────────────


async def get_create_settlement_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> CreateSettlementUseCase:
    return _get_root(request).create_settlement_use_case(session)


async def get_get_group_settlements_use_case(
    request: Request,
    session: Annotated[AsyncSession, Depends(_get_session)],
) -> GetGroupSettlementsUseCase:
    return _get_root(request).get_group_settlements_use_case(session)
