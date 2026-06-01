from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.common.singleton import Singleton
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
from src.domain.users.use_cases.authenticate_user_use_case import (
    AuthenticateUserUseCase,
)
from src.domain.users.use_cases.get_user_use_case import GetUserUseCase
from src.domain.users.use_cases.register_user_use_case import RegisterUserUseCase
from src.infrastructure.auth.jwt_token_service import JWTTokenService
from src.infrastructure.expenses.relational_db.mapper import ExpenseMapper
from src.infrastructure.expenses.relational_db.relational_db_expenses_repository import (
    RelationalDBExpensesRepository,
)
from src.infrastructure.groups.relational_db.mapper import GroupMapper
from src.infrastructure.groups.relational_db.relational_db_groups_repository import (
    RelationalDBGroupsRepository,
)
from src.infrastructure.security.argon2_password_hasher import Argon2PasswordHasher
from src.infrastructure.settlements.relational_db.mapper import SettlementMapper
from src.infrastructure.settlements.relational_db.relational_db_settlements_repository import (
    RelationalDBSettlementsRepository,
)
from src.infrastructure.users.relational_db.mapper import UserMapper
from src.infrastructure.users.relational_db.relational_db_users_repository import (
    RelationalDBUsersRepository,
)
from src.presentation.rest_api.api_settings import ApiSettings


class CompositionRoot(metaclass=Singleton):
    def __init__(self, settings: ApiSettings) -> None:
        # Engine + session factory
        self._engine = create_async_engine(settings.database_uri)
        self._session_factory = async_sessionmaker(
            self._engine, expire_on_commit=False, class_=AsyncSession
        )

        # App-scoped: stateless, created once, shared across all requests
        self._user_mapper = UserMapper()
        self._group_mapper = GroupMapper()
        self._expense_mapper = ExpenseMapper()
        self._settlement_mapper = SettlementMapper()
        self._password_hasher = Argon2PasswordHasher()

        # JWT service: app-scoped (stateless)
        self.token_service = JWTTokenService(
            secret_key=settings.secret_key,
            algorithm=settings.algorithm,
            expire_minutes=settings.access_token_expire_minutes,
            refresh_expire_days=settings.refresh_token_expire_days,
        )

    async def startup(self) -> None:
        pass

    async def shutdown(self) -> None:
        await self._engine.dispose()

    # ── Session factory (request-scoped) ──────────────────────────────────
    def make_session(self) -> AsyncSession:
        return self._session_factory()

    # ── Repository factories (request-scoped) ─────────────────────────────
    def _users_repo(self, session: AsyncSession) -> RelationalDBUsersRepository:
        return RelationalDBUsersRepository(session, self._user_mapper)

    def _groups_repo(self, session: AsyncSession) -> RelationalDBGroupsRepository:
        return RelationalDBGroupsRepository(session, self._group_mapper)

    def _expenses_repo(self, session: AsyncSession) -> RelationalDBExpensesRepository:
        return RelationalDBExpensesRepository(session, self._expense_mapper)

    def _settlements_repo(
        self, session: AsyncSession
    ) -> RelationalDBSettlementsRepository:
        return RelationalDBSettlementsRepository(session, self._settlement_mapper)

    # ── Users use cases ───────────────────────────────────────────────────
    def register_use_case(self, session: AsyncSession) -> RegisterUserUseCase:
        return RegisterUserUseCase(self._users_repo(session), self._password_hasher)

    def authenticate_use_case(self, session: AsyncSession) -> AuthenticateUserUseCase:
        return AuthenticateUserUseCase(self._users_repo(session), self._password_hasher)

    def get_user_use_case(self, session: AsyncSession) -> GetUserUseCase:
        return GetUserUseCase(self._users_repo(session))

    # ── Groups use cases ──────────────────────────────────────────────────
    def create_group_use_case(self, session: AsyncSession) -> CreateGroupUseCase:
        return CreateGroupUseCase(self._groups_repo(session), self._users_repo(session))

    def get_group_use_case(self, session: AsyncSession) -> GetGroupUseCase:
        return GetGroupUseCase(self._groups_repo(session))

    def get_group_balances_use_case(
        self, session: AsyncSession
    ) -> GetGroupBalancesUseCase:
        return GetGroupBalancesUseCase(
            self._groups_repo(session),
            self._expenses_repo(session),
            self._settlements_repo(session),
        )

    def add_participant_to_group_use_case(
        self, session: AsyncSession
    ) -> AddParticipantToGroupUseCase:
        return AddParticipantToGroupUseCase(
            self._groups_repo(session), self._users_repo(session)
        )

    def remove_participant_from_group_use_case(
        self, session: AsyncSession
    ) -> RemoveParticipantFromGroupUseCase:
        return RemoveParticipantFromGroupUseCase(self._groups_repo(session))

    def update_group_name_use_case(
        self, session: AsyncSession
    ) -> UpdateGroupNameUseCase:
        return UpdateGroupNameUseCase(self._groups_repo(session))

    def delete_group_use_case(self, session: AsyncSession) -> DeleteGroupUseCase:
        return DeleteGroupUseCase(
            self._groups_repo(session),
            self._expenses_repo(session),
            self._settlements_repo(session),
        )

    def list_user_groups_use_case(self, session: AsyncSession) -> ListUserGroupsUseCase:
        return ListUserGroupsUseCase(self._groups_repo(session))

    def claim_participant_use_case(
        self, session: AsyncSession
    ) -> ClaimParticipantUseCase:
        return ClaimParticipantUseCase(self._groups_repo(session))

    # ── Expenses use cases ────────────────────────────────────────────────
    def create_expense_use_case(self, session: AsyncSession) -> CreateExpenseUseCase:
        return CreateExpenseUseCase(
            self._expenses_repo(session), self._groups_repo(session)
        )

    def get_expense_use_case(self, session: AsyncSession) -> GetExpenseUseCase:
        return GetExpenseUseCase(self._expenses_repo(session))

    def list_group_expenses_use_case(
        self, session: AsyncSession
    ) -> ListGroupExpensesUseCase:
        return ListGroupExpensesUseCase(
            self._expenses_repo(session), self._groups_repo(session)
        )

    def update_expense_use_case(self, session: AsyncSession) -> UpdateExpenseUseCase:
        return UpdateExpenseUseCase(
            self._expenses_repo(session), self._groups_repo(session)
        )

    def delete_expense_use_case(self, session: AsyncSession) -> DeleteExpenseUseCase:
        return DeleteExpenseUseCase(self._expenses_repo(session))

    # ── Settlements use cases ─────────────────────────────────────────────
    def create_settlement_use_case(
        self, session: AsyncSession
    ) -> CreateSettlementUseCase:
        return CreateSettlementUseCase(
            self._settlements_repo(session),
            self._groups_repo(session),
        )

    def get_group_settlements_use_case(
        self, session: AsyncSession
    ) -> GetGroupSettlementsUseCase:
        return GetGroupSettlementsUseCase(
            self._settlements_repo(session), self._groups_repo(session)
        )
