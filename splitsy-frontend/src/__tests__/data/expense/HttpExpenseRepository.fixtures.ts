import type { MockWebServer } from '@tests/MockWebServer';
import { TEST_BASE_URL } from '@tests/mocks/api';

export const rawExpenseResponse = {
  id: 'exp-1',
  group_id: 'grp-1',
  name: 'Dinner',
  amount: 100.0,
  date: '2024-01-15T00:00:00Z',
  paid_by: 'user-1',
  splits: [
    { participant_id: 'user-1', amount: 50.0 },
    { participant_id: 'user-2', amount: 50.0 },
  ],
  description: null,
};

export function givenCreateExpenseSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'post',
    url: `${TEST_BASE_URL}/expenses/group/${groupId}`,
    response: rawExpenseResponse,
  }]);
}

export function givenListExpensesSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/expenses/group/${groupId}`,
    response: [rawExpenseResponse],
  }]);
}

export function givenGetExpenseSuccess(server: MockWebServer, expenseId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/expenses/${expenseId}`,
    response: rawExpenseResponse,
  }]);
}

export function givenUpdateExpenseSuccess(server: MockWebServer, expenseId: string) {
  server.addRequestHandlers([{
    method: 'patch',
    url: `${TEST_BASE_URL}/expenses/${expenseId}`,
    response: rawExpenseResponse,
  }]);
}

export function givenDeleteExpenseSuccess(server: MockWebServer, expenseId: string) {
  server.addRequestHandlers([{
    method: 'delete',
    url: `${TEST_BASE_URL}/expenses/${expenseId}`,
    response: {},
    code: 204,
  }]);
}

export function givenListExpensesError(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/expenses/group/${groupId}`,
    response: { detail: 'Not found' },
    code: 404,
  }]);
}
