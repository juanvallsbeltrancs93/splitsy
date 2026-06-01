import { createApiClient, createPublicApiClient } from './data/shared/apiClient';

import { AuthApi } from './data/apis/auth/authApi';
import { UsersApi } from './data/apis/users/usersApi';
import { GroupsApi } from './data/apis/groups/groupsApi';
import { ExpensesApi } from './data/apis/expenses/expensesApi';
import { SettlementsApi } from './data/apis/settlements/settlementsApi';

import { AuthApiRepository } from './data/auth/AuthApiRepository';
import { UsersApiRepository } from './data/users/UsersApiRepository';
import { GroupsApiRepository } from './data/group/GroupsApiRepository';
import { ExpensesApiRepository } from './data/expense/ExpensesApiRepository';
import { SettlementsApiRepository } from './data/settlement/SettlementsApiRepository';

import { LoginUseCase } from './domain/auth/use-cases/LoginUseCase';
import { RegisterUseCase } from './domain/auth/use-cases/RegisterUseCase';
import { GetMeUseCase } from './domain/users/use-cases/GetMeUseCase';
import { ListGroupsUseCase } from './domain/group/use-cases/ListGroupsUseCase';
import { CreateGroupUseCase } from './domain/group/use-cases/CreateGroupUseCase';
import { GetGroupUseCase } from './domain/group/use-cases/GetGroupUseCase';
import { UpdateGroupUseCase } from './domain/group/use-cases/UpdateGroupUseCase';
import { DeleteGroupUseCase } from './domain/group/use-cases/DeleteGroupUseCase';
import { AddParticipantUseCase } from './domain/group/use-cases/AddParticipantUseCase';
import { RemoveParticipantUseCase } from './domain/group/use-cases/RemoveParticipantUseCase';
import { GetBalancesUseCase } from './domain/group/use-cases/GetBalancesUseCase';
import { ClaimParticipantUseCase } from './domain/group/use-cases/ClaimParticipantUseCase';
import { CreateExpenseUseCase } from './domain/expense/use-cases/CreateExpenseUseCase';
import { ListExpensesUseCase } from './domain/expense/use-cases/ListExpensesUseCase';
import { GetExpenseUseCase } from './domain/expense/use-cases/GetExpenseUseCase';
import { UpdateExpenseUseCase } from './domain/expense/use-cases/UpdateExpenseUseCase';
import { DeleteExpenseUseCase } from './domain/expense/use-cases/DeleteExpenseUseCase';
import { CreateSettlementUseCase } from './domain/settlement/use-cases/CreateSettlementUseCase';
import { ListSettlementsUseCase } from './domain/settlement/use-cases/ListSettlementsUseCase';

export type CompositionRoot = ReturnType<typeof createCompositionRoot>;

let _instance: CompositionRoot | null = null;

function createCompositionRoot() {
  const http = createApiClient();
  const publicHttp = createPublicApiClient();

  // API layer
  const authApi = new AuthApi(publicHttp);
  const usersApi = new UsersApi(http);
  const groupsApi = new GroupsApi(http);
  const expensesApi = new ExpensesApi(http, groupsApi);
  const settlementsApi = new SettlementsApi(http, groupsApi);

  // Repositories
  const authRepository = new AuthApiRepository(authApi);
  const userRepository = new UsersApiRepository(usersApi);
  const groupRepository = new GroupsApiRepository(groupsApi);
  const expenseRepository = new ExpensesApiRepository(expensesApi);
  const settlementRepository = new SettlementsApiRepository(settlementsApi);

  return {
    useCases: {
      auth: {
        login: new LoginUseCase(authRepository),
        register: new RegisterUseCase(authRepository),
      },
      users: {
        getMe: new GetMeUseCase(userRepository),
      },
      groups: {
        list: new ListGroupsUseCase(groupRepository),
        create: new CreateGroupUseCase(groupRepository),
        get: new GetGroupUseCase(groupRepository),
        update: new UpdateGroupUseCase(groupRepository),
        delete: new DeleteGroupUseCase(groupRepository),
        addParticipant: new AddParticipantUseCase(groupRepository),
        removeParticipant: new RemoveParticipantUseCase(groupRepository),
        getBalances: new GetBalancesUseCase(groupRepository),
        claimParticipant: new ClaimParticipantUseCase(groupRepository),
      },
      expenses: {
        create: new CreateExpenseUseCase(expenseRepository),
        list: new ListExpensesUseCase(expenseRepository),
        get: new GetExpenseUseCase(expenseRepository),
        update: new UpdateExpenseUseCase(expenseRepository),
        delete: new DeleteExpenseUseCase(expenseRepository),
      },
      settlements: {
        create: new CreateSettlementUseCase(settlementRepository),
        list: new ListSettlementsUseCase(settlementRepository),
      },
    },
  };
}

export function getCompositionRoot(): CompositionRoot {
  if (!_instance) {
    _instance = createCompositionRoot();
  }
  return _instance;
}

export function clearCompositionRoot(): void {
  _instance = null;
}
