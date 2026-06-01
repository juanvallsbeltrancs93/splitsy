import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { GroupsApi } from '@data/apis/groups/groupsApi';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';

const mockWebServer = new MockWebServer();

function createApi() {
  return new GroupsApi(provideApi());
}

function givenListGroupsError(mockWebServer: MockWebServer, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'get',
    url: 'http://testing-url.com/api/splitsy/v0/groups',
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenGetGroupError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'get',
    url: `http://testing-url.com/api/splitsy/v0/groups/${groupId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenGetBalancesError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'get',
    url: `http://testing-url.com/api/splitsy/v0/groups/${groupId}/balances`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenCreateGroupError(mockWebServer: MockWebServer, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'post',
    url: 'http://testing-url.com/api/splitsy/v0/groups',
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenUpdateGroupError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'patch',
    url: `http://testing-url.com/api/splitsy/v0/groups/${groupId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenDeleteGroupError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'delete',
    url: `http://testing-url.com/api/splitsy/v0/groups/${groupId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenAddParticipantError(mockWebServer: MockWebServer, groupId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'post',
    url: `http://testing-url.com/api/splitsy/v0/groups/${groupId}/participants`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenRemoveParticipantError(mockWebServer: MockWebServer, groupId: string, participantId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'delete',
    url: `http://testing-url.com/api/splitsy/v0/groups/${groupId}/participants/${participantId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenClaimParticipantError(mockWebServer: MockWebServer, groupId: string, participantId: string, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'post',
    url: `http://testing-url.com/api/splitsy/v0/groups/${groupId}/claim/${participantId}`,
    response: { detail: 'Internal server error' },
    code,
  }]);
}

describe('GroupsApi caching', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should cache get() result and return it on second call without HTTP request', async () => {
    let requestCount = 0;
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1',
      response: { id: 'group-1', name: 'Test', participants: [] },
    }]);

    const api = createApi();
    const first = await api.get('group-1');
    const second = await api.get('group-1');

    expect(first.id).toBe('group-1');
    expect(second.id).toBe('group-1');
    expect(second).toBe(first); // same reference = cached
  });

  it('should cache getBalances() per groupId and return cached on second call', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1/balances',
      response: [{ participant_id: 'p1', balance: 10 }],
    }]);

    const api = createApi();
    const first = await api.getBalances('group-1');
    const second = await api.getBalances('group-1');

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(second).toBe(first); // same reference = cached
  });

  it('should invalidate balances cache so next call hits HTTP', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1/balances',
      response: [{ participant_id: 'p1', balance: 10 }],
    }]);

    const api = createApi();
    const first = await api.getBalances('group-1');
    api.invalidateBalances('group-1');

    // After invalidation, a new request should be made
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1/balances',
      response: [{ participant_id: 'p1', balance: 20 }],
    }]);

    const second = await api.getBalances('group-1');
    expect(second[0].balance).toBe(20);
    expect(second).not.toBe(first);
  });

  it('should cache getBalances independently per groupId', async () => {
    mockWebServer.addRequestHandlers([
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/groups/group-a/balances',
        response: [{ participant_id: 'p1', balance: 10 }],
      },
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/groups/group-b/balances',
        response: [{ participant_id: 'p2', balance: 20 }],
      },
    ]);

    const api = createApi();
    const balancesA = await api.getBalances('group-a');
    const balancesB = await api.getBalances('group-b');

    expect(balancesA[0].balance).toBe(10);
    expect(balancesB[0].balance).toBe(20);
  });

  it('should invalidate only the specified group balances', async () => {
    mockWebServer.addRequestHandlers([
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/groups/group-a/balances',
        response: [{ participant_id: 'p1', balance: 10 }],
      },
      {
        method: 'get',
        url: 'http://testing-url.com/api/splitsy/v0/groups/group-b/balances',
        response: [{ participant_id: 'p2', balance: 20 }],
      },
    ]);

    const api = createApi();
    const balancesA = await api.getBalances('group-a');
    const balancesB = await api.getBalances('group-b');

    api.invalidateBalances('group-a');

    // group-a should fetch fresh data
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-a/balances',
      response: [{ participant_id: 'p1', balance: 99 }],
    }]);

    const freshA = await api.getBalances('group-a');
    const cachedB = await api.getBalances('group-b');

    expect(freshA[0].balance).toBe(99);
    expect(cachedB).toBe(balancesB); // still cached
  });

  it('should send correct request body on create', async () => {
    let capturedRequest: Request | null = null;
    mockWebServer.addVerificationListener((req) => {
      if (req.url.includes('/groups') && !req.url.includes('/balances') && !req.url.includes('/participants')) {
        capturedRequest = req;
      }
    });

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/groups',
      response: { id: 'group-new', name: 'Trip', participants: [] },
    }]);

    const api = createApi();
    await api.create({ name: 'Trip', aliases: ['A', 'B'], currency: 'USD' });

    expect(capturedRequest).not.toBeNull();
    const body = await capturedRequest!.json();
    expect(body.name).toBe('Trip');
    expect(body.aliases).toEqual(['A', 'B']);
    expect(body.currency).toBe('USD');
  });

  it('should throw on list() when server returns 500', async () => {
    givenListGroupsError(mockWebServer, 500);
    const api = createApi();
    await expect(api.list()).rejects.toThrow();
  });

  it('should throw on get() when server returns 500', async () => {
    givenGetGroupError(mockWebServer, 'group-1', 500);
    const api = createApi();
    await expect(api.get('group-1')).rejects.toThrow();
  });

  it('should throw on getBalances() when server returns 500', async () => {
    givenGetBalancesError(mockWebServer, 'group-1', 500);
    const api = createApi();
    await expect(api.getBalances('group-1')).rejects.toThrow();
  });

  it('should throw on create() when server returns 500', async () => {
    givenCreateGroupError(mockWebServer, 500);
    const api = createApi();
    await expect(api.create({ name: 'Trip', aliases: ['A', 'B'], currency: 'USD' })).rejects.toThrow();
  });

  it('should throw on update() when server returns 500', async () => {
    givenUpdateGroupError(mockWebServer, 'group-1', 500);
    const api = createApi();
    await expect(api.update('group-1', { name: 'Updated' })).rejects.toThrow();
  });

  it('should throw on delete() when server returns 500', async () => {
    givenDeleteGroupError(mockWebServer, 'group-1', 500);
    const api = createApi();
    await expect(api.delete('group-1')).rejects.toThrow();
  });

  it('should throw on addParticipant() when server returns 500', async () => {
    givenAddParticipantError(mockWebServer, 'group-1', 500);
    const api = createApi();
    await expect(api.addParticipant('group-1', { name: 'New Participant' })).rejects.toThrow();
  });

  it('should throw on removeParticipant() when server returns 500', async () => {
    givenRemoveParticipantError(mockWebServer, 'group-1', 'p1', 500);
    const api = createApi();
    await expect(api.removeParticipant('group-1', 'p1')).rejects.toThrow();
  });

  it('should throw on claimParticipant() when server returns 500', async () => {
    givenClaimParticipantError(mockWebServer, 'group-1', 'p1', 500);
    const api = createApi();
    await expect(api.claimParticipant('group-1', 'p1')).rejects.toThrow();
  });

  it('should always make an HTTP request for list()', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups',
      response: [{ id: 'group-1', name: 'Test', participants: [] }],
    }]);

    const api = createApi();
    await api.list();
    const requestsAfterFirst = mockWebServer.getAllRequests().length;

    await api.list();
    const requestsAfterSecond = mockWebServer.getAllRequests().length;

    expect(requestsAfterSecond).toBe(requestsAfterFirst + 1);
  });

  it('should make only one HTTP request for get() when cached', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1',
      response: { id: 'group-1', name: 'Test', participants: [] },
    }]);

    const api = createApi();
    await api.get('group-1');
    const requestsAfterFirst = mockWebServer.getAllRequests().length;

    await api.get('group-1');
    const requestsAfterSecond = mockWebServer.getAllRequests().length;

    expect(requestsAfterSecond).toBe(requestsAfterFirst);
  });

  it('should make only one HTTP request for getBalances() when cached', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1/balances',
      response: [{ participant_id: 'p1', balance: 10 }],
    }]);

    const api = createApi();
    await api.getBalances('group-1');
    const requestsAfterFirst = mockWebServer.getAllRequests().length;

    await api.getBalances('group-1');
    const requestsAfterSecond = mockWebServer.getAllRequests().length;

    expect(requestsAfterSecond).toBe(requestsAfterFirst);
  });

  it('should always fetch from API for list() even after create', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups',
      response: [
        { id: 'group-1', name: 'Test', participants: [] },
        { id: 'group-new', name: 'Trip', participants: [] },
      ],
    }]);

    const api = createApi();

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/groups',
      response: { id: 'group-new', name: 'Trip', participants: [] },
    }]);

    await api.create({ name: 'Trip', aliases: ['A', 'B'], currency: 'USD' });

    const listAfterCreate = await api.list();
    const requestsAfterCreateList = mockWebServer.getAllRequests().length;

    expect(listAfterCreate).toHaveLength(2);
    expect(requestsAfterCreateList).toBe(2); // 1 POST + 1 GET
  });

  it('should not make extra get HTTP request after update updates cache', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1',
      response: { id: 'group-1', name: 'Test', participants: [] },
    }]);

    const api = createApi();
    await api.get('group-1');
    const requestsAfterGet = mockWebServer.getAllRequests().length;

    mockWebServer.addRequestHandlers([{
      method: 'patch',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1',
      response: { id: 'group-1', name: 'Updated', participants: [] },
    }]);

    await api.update('group-1', { name: 'Updated' });

    const getAfterUpdate = await api.get('group-1');
    const requestsAfterUpdateGet = mockWebServer.getAllRequests().length;

    expect(getAfterUpdate.name).toBe('Updated');
    expect(requestsAfterUpdateGet).toBe(requestsAfterGet + 1);
  });

  it('should always fetch from API for list() even after delete', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/groups',
      response: [{ id: 'group-2', name: 'Test B', participants: [] }],
    }]);

    const api = createApi();

    mockWebServer.addRequestHandlers([{
      method: 'delete',
      url: 'http://testing-url.com/api/splitsy/v0/groups/group-1',
      response: {},
      code: 204,
    }]);

    await api.delete('group-1');

    const listAfterDelete = await api.list();
    const requestsAfterDeleteList = mockWebServer.getAllRequests().length;

    expect(listAfterDelete).toHaveLength(1);
    expect(requestsAfterDeleteList).toBe(2); // 1 DELETE + 1 GET
  });
});
