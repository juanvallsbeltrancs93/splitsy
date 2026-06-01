from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.composition_root import CompositionRoot
from src.domain.common.errors import ValidationError
from src.domain.expenses.errors.expense_errors import (
    AlreadyExistsExpenseError,
    ExpenseNotFoundError,
    InvalidParticipantError,
)
from src.domain.groups.errors import ParticipantNameAlreadyInGroupError
from src.domain.groups.errors.groups_errors import (
    AlreadyExistsGroupError,
    GroupNotFoundError,
    ParticipantAlreadyClaimedError,
    ParticipantAlreadyInGroupError,
    ParticipantNotAliasError,
    ParticipantNotFoundInGroupError,
)
from src.domain.settlements.errors.settlement_errors import (
    AlreadyExistsSettlementError,
    SettlementNotFoundError,
)
from src.domain.users.errors.user_errors import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
    UserNotFoundError,
)
from src.infrastructure.auth.jwt_token_service import TokenValidationError
from src.presentation.rest_api.api_settings import get_api_settings
from src.presentation.rest_api.routers.health import router as health_router
from src.presentation.rest_api.routers.v0.auth import router as auth_router
from src.presentation.rest_api.routers.v0.expenses import router as expenses_router
from src.presentation.rest_api.routers.v0.groups import router as groups_router
from src.presentation.rest_api.routers.v0.settlements import (
    router as settlements_router,
)
from src.presentation.rest_api.routers.v0.users import router as users_router

settings = get_api_settings()
root = CompositionRoot(settings)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await root.startup()
    app.state.composition_root = root
    yield
    await root.shutdown()


app = FastAPI(
    lifespan=lifespan,
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Splitsy API — track and split shared expenses among groups of people. "
        "Manage groups, add expenses, record settlements, and calculate balances."
    ),
    docs_url=f"{settings.api_prefix}/docs",
    redoc_url=f"{settings.api_prefix}/redoc",
    license_info={"name": "MIT"},
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handlers ─────────────────────────────────────────────────


@app.exception_handler(ValidationError)
async def validation_error_handler(
    request: Request, exc: ValidationError
) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(UserNotFoundError)
async def user_not_found_handler(
    request: Request, exc: UserNotFoundError
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(UserAlreadyExistsError)
async def user_already_exists_handler(
    request: Request, exc: UserAlreadyExistsError
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(InvalidCredentialsError)
async def invalid_credentials_handler(
    request: Request, exc: InvalidCredentialsError
) -> JSONResponse:
    return JSONResponse(status_code=401, content={"detail": str(exc)})


@app.exception_handler(GroupNotFoundError)
async def group_not_found_handler(
    request: Request, exc: GroupNotFoundError
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(AlreadyExistsGroupError)
async def already_exists_group_handler(
    request: Request, exc: AlreadyExistsGroupError
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(ParticipantAlreadyInGroupError)
async def participant_already_in_group_handler(
    request: Request, exc: ParticipantAlreadyInGroupError
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(ParticipantNameAlreadyInGroupError)
async def participant_name_already_in_group_handler(
    request: Request, exc: ParticipantNameAlreadyInGroupError
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(ParticipantNotFoundInGroupError)
async def participant_not_found_in_group_handler(
    request: Request, exc: ParticipantNotFoundInGroupError
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(ParticipantNotAliasError)
async def participant_not_alias_handler(
    request: Request, exc: ParticipantNotAliasError
) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(ParticipantAlreadyClaimedError)
async def participant_already_claimed_handler(
    request: Request, exc: ParticipantAlreadyClaimedError
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(ExpenseNotFoundError)
async def expense_not_found_handler(
    request: Request, exc: ExpenseNotFoundError
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(InvalidParticipantError)
async def invalid_participant_handler(
    request: Request, exc: InvalidParticipantError
) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": str(exc)})


@app.exception_handler(AlreadyExistsExpenseError)
async def already_exists_expense_handler(
    request: Request, exc: AlreadyExistsExpenseError
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(SettlementNotFoundError)
async def settlement_not_found_handler(
    request: Request, exc: SettlementNotFoundError
) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(AlreadyExistsSettlementError)
async def already_exists_settlement_handler(
    request: Request, exc: AlreadyExistsSettlementError
) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(TokenValidationError)
async def token_validation_error_handler(
    request: Request, exc: TokenValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=401,
        content={"detail": str(exc)},
        headers={"WWW-Authenticate": "Bearer"},
    )


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(prefix=settings.api_prefix, router=health_router)
app.include_router(prefix=f"{settings.api_prefix}/v0", router=auth_router)
app.include_router(prefix=f"{settings.api_prefix}/v0", router=users_router)
app.include_router(prefix=f"{settings.api_prefix}/v0", router=groups_router)
app.include_router(prefix=f"{settings.api_prefix}/v0", router=expenses_router)
app.include_router(prefix=f"{settings.api_prefix}/v0", router=settlements_router)
