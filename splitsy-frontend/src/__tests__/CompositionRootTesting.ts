import { provideApi } from './mocks/api';

import { AuthApi } from '@/data/apis/auth/authApi';
import { UsersApi } from '@/data/apis/users/usersApi';
import { GroupsApi } from '@/data/apis/groups/groupsApi';
import { ExpensesApi } from '@/data/apis/expenses/expensesApi';
import { SettlementsApi } from '@/data/apis/settlements/settlementsApi';

import { AuthApiRepository } from '@/data/auth/AuthApiRepository';
import { UsersApiRepository } from '@/data/users/UsersApiRepository';
import { GroupsApiRepository } from '@/data/group/GroupsApiRepository';
import { ExpensesApiRepository } from '@/data/expense/ExpensesApiRepository';
import { SettlementsApiRepository } from '@/data/settlement/SettlementsApiRepository';

import { LoginUseCase } from '@/domain/auth/use-cases/LoginUseCase';
import { RegisterUseCase } from '@/domain/auth/use-cases/RegisterUseCase';
import { GetMeUseCase } from '@/domain/users/use-cases/GetMeUseCase';
import { ListGroupsUseCase } from '@/domain/group/use-cases/ListGroupsUseCase';
import { CreateGroupUseCase } from '@/domain/group/use-cases/CreateGroupUseCase';
import { GetGroupUseCase } from '@/domain/group/use-cases/GetGroupUseCase';
import { UpdateGroupUseCase } from '@/domain/group/use-cases/UpdateGroupUseCase';
import { DeleteGroupUseCase } from '@/domain/group/use-cases/DeleteGroupUseCase';
import { AddParticipantUseCase } from '@/domain/group/use-cases/AddParticipantUseCase';
import { RemoveParticipantUseCase } from '@/domain/group/use-cases/RemoveParticipantUseCase';
import { GetBalancesUseCase } from '@/domain/group/use-cases/GetBalancesUseCase';
import { ClaimParticipantUseCase } from '@/domain/group/use-cases/ClaimParticipantUseCase';
import { CreateExpenseUseCase } from '@/domain/expense/use-cases/CreateExpenseUseCase';
import { ListExpensesUseCase } from '@/domain/expense/use-cases/ListExpensesUseCase';
import { GetExpenseUseCase } from '@/domain/expense/use-cases/GetExpenseUseCase';
import { UpdateExpenseUseCase } from '@/domain/expense/use-cases/UpdateExpenseUseCase';
import { DeleteExpenseUseCase } from '@/domain/expense/use-cases/DeleteExpenseUseCase';
import { CreateSettlementUseCase } from '@/domain/settlement/use-cases/CreateSettlementUseCase';
import { ListSettlementsUseCase } from '@/domain/settlement/use-cases/ListSettlementsUseCase';

export interface TestRepositories {
  groups?: GroupsApiRepository;
  expenses?: ExpensesApiRepository;
  settlements?: SettlementsApiRepository;
  users?: UsersApiRepository;
  auth?: AuthApiRepository;
}

export function provideTestCompositionRoot(overrides: TestRepositories = {}) {
  const http = provideApi();

  const groupsApi = new GroupsApi(http);
  const expensesApi = new ExpensesApi(http, groupsApi);
  const settlementsApi = new SettlementsApi(http, groupsApi);
  const usersApi = new UsersApi(http);
  const authApi = new AuthApi(http);

  const groupsRepository = overrides.groups ?? new GroupsApiRepository(groupsApi);
  const expensesRepository = overrides.expenses ?? new ExpensesApiRepository(expensesApi);
  const settlementsRepository = overrides.settlements ?? new SettlementsApiRepository(settlementsApi);
  const usersRepository = overrides.users ?? new UsersApiRepository(usersApi);
  const authRepository = overrides.auth ?? new AuthApiRepository(authApi);

  return {
    useCases: {
      auth: {
        login: new LoginUseCase(authRepository),
        register: new RegisterUseCase(authRepository),
      },
      users: {
        getMe: new GetMeUseCase(usersRepository),
      },
      groups: {
        list: new ListGroupsUseCase(groupsRepository),
        create: new CreateGroupUseCase(groupsRepository),
        get: new GetGroupUseCase(groupsRepository),
        update: new UpdateGroupUseCase(groupsRepository),
        delete: new DeleteGroupUseCase(groupsRepository),
        addParticipant: new AddParticipantUseCase(groupsRepository),
        removeParticipant: new RemoveParticipantUseCase(groupsRepository),
        getBalances: new GetBalancesUseCase(groupsRepository),
        claimParticipant: new ClaimParticipantUseCase(groupsRepository),
      },
      expenses: {
        create: new CreateExpenseUseCase(expensesRepository),
        list: new ListExpensesUseCase(expensesRepository),
        get: new GetExpenseUseCase(expensesRepository),
        update: new UpdateExpenseUseCase(expensesRepository),
        delete: new DeleteExpenseUseCase(expensesRepository),
      },
      settlements: {
        create: new CreateSettlementUseCase(settlementsRepository),
        list: new ListSettlementsUseCase(settlementsRepository),
      },
    },
    repositories: {
      groups: groupsRepository,
      expenses: expensesRepository,
      settlements: settlementsRepository,
      users: usersRepository,
      auth: authRepository,
    },
  };
}
