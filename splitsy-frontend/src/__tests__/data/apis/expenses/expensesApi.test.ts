import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { ExpensesApi } from '@data/apis/expenses/expensesApi';
import { GroupsApi } from '@data/apis/groups/groupsApi';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';

const mockWebServer = new MockWebServer();

function createApis() {
  const http = provideApi();
  const groupsApi = new GroupsApi(http);
  const expensesApi = new ExpensesApi(http, groupsApi);
  return { groupsApi, expensesApi };
}

function givenListExpensesError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'get',
    url: `http://testing-url.com/api/splitsy/v0/expenses/group/${groupId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenGetExpenseError(mockWebServer: MockWebServer, expenseId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'get',
    url: `http://testing-url.com/api/splitsy/v0/expenses/${expenseId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenCreateExpenseError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'post',
    url: `http://testing-url.com/api/splitsy/v0/expenses/group/${groupId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenUpdateExpenseError(mockWebServer: MockWebServer, expenseId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'patch',
    url: `http://testing-url.com/api/splitsy/v0/expenses/${expenseId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenDeleteExpenseError(mockWebServer: MockWebServer, expenseId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'delete',
    url: `http://testing-url.com/api/splitsy/v0/expenses/${expenseId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

describe('ExpensesApi caching', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should cache list() per groupId', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: [{ id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null }],
      code: 0
    }]);

    const { expensesApi } = createApis();
    const first = await expensesApi.list('grp-1');
    const second = await expensesApi.list('grp-1');

    expect(first).toHaveLength(1);
    expect(second).toBe(first);
  });

  it('should cache get() per expenseId', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
      response: { id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
      code: 0
    }]);

    const { expensesApi } = createApis();
    const first = await expensesApi.get('exp-1');
    const second = await expensesApi.get('exp-1');

    expect(second).toBe(first);
  });

  it('should add created expense to list cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: [{ id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null }],
      code: 0
    }]);

    const { expensesApi } = createApis();
    const listBefore = await expensesApi.list('grp-1');
    expect(listBefore).toHaveLength(1);

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: { id: 'exp-2', group_id: 'grp-1', name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [], description: null },
      code: 0
    }]);

    await expensesApi.create('grp-1', { name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [] });

    const listAfter = await expensesApi.list('grp-1');
    expect(listAfter).toHaveLength(2);
    expect(listAfter.map(e => e.id)).toContain('exp-2');
  });

  it('should update cached expense on update()', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
      response: { id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
      code: 0
    }]);

    const { expensesApi } = createApis();
    const before = await expensesApi.get('exp-1');
    expect(before.name).toBe('Dinner');

    mockWebServer.addRequestHandlers([{
      method: 'patch',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
      response: { id: 'exp-1', group_id: 'grp-1', name: 'Updated Dinner', amount: 120, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
      code: 0
    }]);

    await expensesApi.update('exp-1', { name: 'Updated Dinner', amount: 120 });

    const after = await expensesApi.get('exp-1');
    expect(after.name).toBe('Updated Dinner');
    expect(after.amount).toBe(120);
  });

  it('should remove deleted expense from list cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: [
        { id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
        { id: 'exp-2', group_id: 'grp-1', name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [], description: null },
      ],
      code: 0
    }]);

    const { expensesApi } = createApis();
    const listBefore = await expensesApi.list('grp-1');
    expect(listBefore).toHaveLength(2);

    mockWebServer.addRequestHandlers([{
      method: 'delete',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
      response: {},
      code: 204,
    }]);

    await expensesApi.delete('exp-1');

    const listAfter = await expensesApi.list('grp-1');
    expect(listAfter).toHaveLength(1);
    expect(listAfter[0].id).toBe('exp-2');
  });

  it('should cache list() independently per groupId', async () => {
    mockWebServer.addRequestHandlers([
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-a',
        response: [{ id: 'exp-a', group_id: 'grp-a', name: 'A', amount: 10, date: '2024-01-01', paid_by: 'u1', splits: [], description: null }],
        code: 0
      },
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-b',
        response: [{ id: 'exp-b', group_id: 'grp-b', name: 'B', amount: 20, date: '2024-01-01', paid_by: 'u2', splits: [], description: null }],
        code: 0
      },
    ]);

    const { expensesApi } = createApis();
    const listA = await expensesApi.list('grp-a');
    const listB = await expensesApi.list('grp-b');

    expect(listA[0].name).toBe('A');
    expect(listB[0].name).toBe('B');
  });

  it('should invalidate group balances on update', async () => {
    mockWebServer.addRequestHandlers([
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
        response: { id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
        code: 0
      },
      {
        method: 'patch',
        url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
        response: { id: 'exp-1', group_id: 'grp-1', name: 'Updated', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
        code: 0
      },
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/groups/grp-1/balances',
        response: [{ participant_id: 'p1', balance: 10 }],
        code: 0
      },
    ]);

    const { groupsApi, expensesApi } = createApis();
    const balancesBefore = await groupsApi.getBalances('grp-1');

    await expensesApi.update('exp-1', { name: 'Updated' });

    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/grp-1/balances',
      response: [{ participant_id: 'p1', balance: 30 }],
      code: 0
    }]);

    const balancesAfter = await groupsApi.getBalances('grp-1');
    expect(balancesAfter[0].balance).toBe(30);
    expect(balancesAfter).not.toBe(balancesBefore);
  });

  it('should invalidate group balances on delete', async () => {
    mockWebServer.addRequestHandlers([
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
        response: [{ id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null }],
        code: 0
      },
      {
        method: 'delete',
        url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
        response: {},
        code: 204,
      },
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/groups/grp-1/balances',
        response: [{ participant_id: 'p1', balance: 10 }],
        code: 0
      },
    ]);

    const { groupsApi, expensesApi } = createApis();
    await expensesApi.list('grp-1'); // populate cache so delete knows the group
    const balancesBefore = await groupsApi.getBalances('grp-1');

    await expensesApi.delete('exp-1');

    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/grp-1/balances',
      response: [{ participant_id: 'p1', balance: 40 }],
      code: 0
    }]);

    const balancesAfter = await groupsApi.getBalances('grp-1');
    expect(balancesAfter[0].balance).toBe(40);
    expect(balancesAfter).not.toBe(balancesBefore);
  });

  it('should invalidate group balances on create', async () => {
    mockWebServer.addRequestHandlers([
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/groups/grp-1/balances',
        response: [{ participant_id: 'p1', balance: 10 }],
        code: 0
      },
      {
        method: 'post',
        url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
        response: { id: 'exp-new', group_id: 'grp-1', name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [], description: null },
        code: 0
      },
    ]);

    const { groupsApi, expensesApi } = createApis();
    const balancesBefore = await groupsApi.getBalances('grp-1');

    await expensesApi.create('grp-1', { name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [] });

    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/grp-1/balances',
      response: [{ participant_id: 'p1', balance: 20 }],
      code: 0
    }]);

    const balancesAfter = await groupsApi.getBalances('grp-1');
    expect(balancesAfter[0].balance).toBe(20);
    expect(balancesAfter).not.toBe(balancesBefore);
  });

  it('should send correct request body on create', async () => {
    let capturedRequest: Request | null = null;
    mockWebServer.addVerificationListener((req) => {
      if (req.url.includes('/expenses/group/grp-1') && req.method === 'POST') {
        capturedRequest = req;
      }
    });

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: { id: 'exp-new', group_id: 'grp-1', name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [], description: null },
      code: 0
    }]);

    const { expensesApi } = createApis();
    await expensesApi.create('grp-1', { name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [] });

    expect(capturedRequest).not.toBeNull();
    const body = await capturedRequest!.json();
    expect(body.name).toBe('Lunch');
    expect(body.amount).toBe(50);
    expect(body.date).toBe('2024-01-02');
    expect(body.paid_by).toBe('u2');
    expect(body.splits).toEqual([]);
  });

  it('should throw on list() when server returns 500', async () => {
    givenListExpensesError(mockWebServer, 'grp-1', 500);
    const { expensesApi } = createApis();
    await expect(expensesApi.list('grp-1')).rejects.toThrow();
  });

  it('should throw on get() when server returns 500', async () => {
    givenGetExpenseError(mockWebServer, 'exp-1', 500);
    const { expensesApi } = createApis();
    await expect(expensesApi.get('exp-1')).rejects.toThrow();
  });

  it('should throw on create() when server returns 500', async () => {
    givenCreateExpenseError(mockWebServer, 'grp-1', 500);
    const { expensesApi } = createApis();
    await expect(expensesApi.create('grp-1', { name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [] })).rejects.toThrow();
  });

  it('should throw on update() when server returns 500', async () => {
    givenUpdateExpenseError(mockWebServer, 'exp-1', 500);
    const { expensesApi } = createApis();
    await expect(expensesApi.update('exp-1', { name: 'Updated', amount: 120 })).rejects.toThrow();
  });

  it('should throw on delete() when server returns 500', async () => {
    givenDeleteExpenseError(mockWebServer, 'exp-1', 500);
    const { expensesApi } = createApis();
    await expect(expensesApi.delete('exp-1')).rejects.toThrow();
  });

  it('should make only one HTTP request for list() when cached', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: [{ id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null }],
      code: 0
    }]);

    const { expensesApi } = createApis();
    await expensesApi.list('grp-1');
    const requestsAfterFirst = mockWebServer.getAllRequests().length;

    await expensesApi.list('grp-1');
    const requestsAfterSecond = mockWebServer.getAllRequests().length;

    expect(requestsAfterSecond).toBe(requestsAfterFirst);
  });

  it('should make only one HTTP request for get() when cached', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
      response: { id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
      code: 0
    }]);

    const { expensesApi } = createApis();
    await expensesApi.get('exp-1');
    const requestsAfterFirst = mockWebServer.getAllRequests().length;

    await expensesApi.get('exp-1');
    const requestsAfterSecond = mockWebServer.getAllRequests().length;

    expect(requestsAfterSecond).toBe(requestsAfterFirst);
  });

  it('should not make extra list HTTP request after create updates cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: [{ id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null }],
      code: 0
    }]);

    const { expensesApi } = createApis();
    await expensesApi.list('grp-1');
    const requestsAfterList = mockWebServer.getAllRequests().length;

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: { id: 'exp-2', group_id: 'grp-1', name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [], description: null },
      code: 0
    }]);

    await expensesApi.create('grp-1', { name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [] });

    const listAfterCreate = await expensesApi.list('grp-1');
    const requestsAfterCreateList = mockWebServer.getAllRequests().length;

    expect(listAfterCreate).toHaveLength(2);
    expect(requestsAfterCreateList).toBe(requestsAfterList + 1);
  });

  it('should not make extra get HTTP request after update updates cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
      response: { id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
      code: 0
    }]);

    const { expensesApi } = createApis();
    await expensesApi.get('exp-1');
    const requestsAfterGet = mockWebServer.getAllRequests().length;

    mockWebServer.addRequestHandlers([{
      method: 'patch',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
      response: { id: 'exp-1', group_id: 'grp-1', name: 'Updated Dinner', amount: 120, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
      code: 0
    }]);

    await expensesApi.update('exp-1', { name: 'Updated Dinner', amount: 120 });

    const getAfterUpdate = await expensesApi.get('exp-1');
    const requestsAfterUpdateGet = mockWebServer.getAllRequests().length;

    expect(getAfterUpdate.name).toBe('Updated Dinner');
    expect(requestsAfterUpdateGet).toBe(requestsAfterGet + 1);
  });

  it('should not make extra list HTTP request after delete updates cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/group/grp-1',
      response: [
        { id: 'exp-1', group_id: 'grp-1', name: 'Dinner', amount: 100, date: '2024-01-01', paid_by: 'u1', splits: [], description: null },
        { id: 'exp-2', group_id: 'grp-1', name: 'Lunch', amount: 50, date: '2024-01-02', paid_by: 'u2', splits: [], description: null },
      ],
      code: 0
    }]);

    const { expensesApi } = createApis();
    await expensesApi.list('grp-1');
    const requestsAfterList = mockWebServer.getAllRequests().length;

    mockWebServer.addRequestHandlers([{
      method: 'delete',
      url: 'http://testing-url.com/api/splitsy/v0/expenses/exp-1',
      response: {},
      code: 204,
    }]);

    await expensesApi.delete('exp-1');

    const listAfterDelete = await expensesApi.list('grp-1');
    const requestsAfterDeleteList = mockWebServer.getAllRequests().length;

    expect(listAfterDelete).toHaveLength(1);
    expect(requestsAfterDeleteList).toBe(requestsAfterList + 1);
  });
});
