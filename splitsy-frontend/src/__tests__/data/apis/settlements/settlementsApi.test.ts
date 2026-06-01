import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { SettlementsApi } from '@data/apis/settlements/settlementsApi';
import { GroupsApi } from '@data/apis/groups/groupsApi';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';

const mockWebServer = new MockWebServer();

function createApis() {
  const http = provideApi();
  const groupsApi = new GroupsApi(http);
  const settlementsApi = new SettlementsApi(http, groupsApi);
  return { groupsApi, settlementsApi };
}

function givenListSettlementsError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'get',
    url: `http://testing-url.com/api/splitsy/v0/settlements/group/${groupId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenCreateSettlementError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'post',
    url: `http://testing-url.com/api/splitsy/v0/settlements/group/${groupId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

describe('SettlementsApi caching', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should cache list() per groupId', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: [{ id: 'set-1', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-01', note: null }],
      code: 0
    }]);

    const { settlementsApi } = createApis();
    const first = await settlementsApi.list('grp-1');
    const second = await settlementsApi.list('grp-1');

    expect(first).toHaveLength(1);
    expect(second).toBe(first);
  });

  it('should add created settlement to list cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: [{ id: 'set-1', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-01', note: null }],
      code: 0
    }]);

    const { settlementsApi } = createApis();
    const listBefore = await settlementsApi.list('grp-1');
    expect(listBefore).toHaveLength(1);

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: { id: 'set-2', group_id: 'grp-1', from_participant_id: 'u2', to_participant_id: 'u1', amount: 30, date: '2024-01-02', note: null },
      code: 0
    }]);

    await settlementsApi.create('grp-1', { from_participant_id: 'u2', to_participant_id: 'u1', amount: 30, date: '2024-01-02' });

    const listAfter = await settlementsApi.list('grp-1');
    expect(listAfter).toHaveLength(2);
    expect(listAfter.map(s => s.id)).toContain('set-2');
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
        url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
        response: { id: 'set-new', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-02', note: null },
        code: 0
      },
    ]);

    const { groupsApi, settlementsApi } = createApis();
    const balancesBefore = await groupsApi.getBalances('grp-1');

    await settlementsApi.create('grp-1', { from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-02' });

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

  it('should cache list() independently per groupId', async () => {
    mockWebServer.addRequestHandlers([
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-a',
        response: [{ id: 'set-a', group_id: 'grp-a', from_participant_id: 'u1', to_participant_id: 'u2', amount: 10, date: '2024-01-01', note: null }],
        code: 0
      },
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-b',
        response: [{ id: 'set-b', group_id: 'grp-b', from_participant_id: 'u2', to_participant_id: 'u1', amount: 20, date: '2024-01-01', note: null }],
        code: 0
      },
    ]);

    const { settlementsApi } = createApis();
    const listA = await settlementsApi.list('grp-a');
    const listB = await settlementsApi.list('grp-b');

    expect(listA[0].id).toBe('set-a');
    expect(listB[0].id).toBe('set-b');
  });

  it('should work without groupsApi (backward compatible)', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: { id: 'set-new', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-02', note: null },
      code: 0
    }]);

    const http = provideApi();
    const settlementsApi = new SettlementsApi(http);
    const result = await settlementsApi.create('grp-1', { from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-02' });

    expect(result.id).toBe('set-new');
  });

  it('should send correct request body on create', async () => {
    let capturedRequest: Request | null = null;
    mockWebServer.addVerificationListener((req) => {
      if (req.url.includes('/settlements/group/grp-1')) {
        capturedRequest = req;
      }
    });

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: { id: 'set-new', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-02', note: null },
      code: 0
    }]);

    const { settlementsApi } = createApis();
    await settlementsApi.create('grp-1', { from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-02' });

    expect(capturedRequest).not.toBeNull();
    const body = await capturedRequest!.json();
    expect(body.from_participant_id).toBe('u1');
    expect(body.to_participant_id).toBe('u2');
    expect(body.amount).toBe(50);
    expect(body.date).toBe('2024-01-02');
  });

  it('should throw on list() when server returns 500', async () => {
    givenListSettlementsError(mockWebServer, 'grp-1', 500);
    const { settlementsApi } = createApis();
    await expect(settlementsApi.list('grp-1')).rejects.toThrow();
  });

  it('should throw on create() when server returns 500', async () => {
    givenCreateSettlementError(mockWebServer, 'grp-1', 500);
    const { settlementsApi } = createApis();
    await expect(settlementsApi.create('grp-1', { from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-02' })).rejects.toThrow();
  });

  it('should make only one HTTP request for list() when cached', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: [{ id: 'set-1', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-01', note: null }],
      code: 0
    }]);

    const { settlementsApi } = createApis();
    await settlementsApi.list('grp-1');
    const requestsAfterFirst = mockWebServer.getAllRequests().length;

    await settlementsApi.list('grp-1');
    const requestsAfterSecond = mockWebServer.getAllRequests().length;

    expect(requestsAfterSecond).toBe(requestsAfterFirst);
  });

  it('should not make extra list HTTP request after create updates cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: [{ id: 'set-1', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-01', note: null }],
      code: 0
    }]);

    const { settlementsApi } = createApis();
    await settlementsApi.list('grp-1');
    const requestsAfterList = mockWebServer.getAllRequests().length;

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: { id: 'set-2', group_id: 'grp-1', from_participant_id: 'u2', to_participant_id: 'u1', amount: 30, date: '2024-01-02', note: null },
      code: 0
    }]);

    await settlementsApi.create('grp-1', { from_participant_id: 'u2', to_participant_id: 'u1', amount: 30, date: '2024-01-02' });

    const listAfterCreate = await settlementsApi.list('grp-1');
    const requestsAfterCreateList = mockWebServer.getAllRequests().length;

    expect(listAfterCreate).toHaveLength(2);
    expect(requestsAfterCreateList).toBe(requestsAfterList + 1);
  });

  it('should invalidate settlements cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: [{ id: 'set-1', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-01', note: null }],
      code: 0
    }]);

    const { settlementsApi } = createApis();
    const first = await settlementsApi.list('grp-1');

    settlementsApi.invalidateSettlements('grp-1');

    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/settlements/group/grp-1',
      response: [{ id: 'set-1', group_id: 'grp-1', from_participant_id: 'u1', to_participant_id: 'u2', amount: 50, date: '2024-01-01', note: null }],
      code: 0
    }]);

    const second = await settlementsApi.list('grp-1');
    expect(second).not.toBe(first);
  });
});
