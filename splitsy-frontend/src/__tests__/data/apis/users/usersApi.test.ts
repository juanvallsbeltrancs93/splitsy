import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { UsersApi } from '@data/apis/users/usersApi';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';

const mockWebServer = new MockWebServer();

function createApi() {
  return new UsersApi(provideApi());
}

function givenGetMeError(mockWebServer: MockWebServer, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'get',
    url: 'http://testing-url.com/api/splitsy/v0/users/me',
    response: { detail: 'Internal server error' },
    code,
  }]);
}

describe('UsersApi caching', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should cache getMe() result', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/users/me',
      response: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    }]);

    const api = createApi();
    const first = await api.getMe();
    const second = await api.getMe();

    expect(first.id).toBe('user-1');
    expect(second).toBe(first);
  });

  it('should return fresh data after cache is bypassed by new instance', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/users/me',
      response: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    }]);

    const api1 = createApi();
    const result1 = await api1.getMe();

    // A different instance should have its own cache
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/users/me',
      response: { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
    }]);

    const api2 = createApi();
    const result2 = await api2.getMe();

    expect(result1.id).toBe('user-1');
    expect(result2.id).toBe('user-2');
  });

  it('should send GET request to correct endpoint', async () => {
    let capturedRequest: Request | null = null;
    mockWebServer.addVerificationListener((req) => {
      if (req.url.includes('/users/me')) {
        capturedRequest = req;
      }
    });

    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/users/me',
      response: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    }]);

    const api = createApi();
    await api.getMe();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.method).toBe('GET');
  });

  it('should throw on getMe() when server returns 500', async () => {
    givenGetMeError(mockWebServer, 500);
    const api = createApi();
    await expect(api.getMe()).rejects.toThrow();
  });

  it('should make only one HTTP request for getMe() when cached', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'get',
      url: 'http://testing-url.com/api/splitsy/v0/users/me',
      response: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    }]);

    const api = createApi();
    await api.getMe();
    const requestsAfterFirst = mockWebServer.getAllRequests().length;

    await api.getMe();
    const requestsAfterSecond = mockWebServer.getAllRequests().length;

    expect(requestsAfterSecond).toBe(requestsAfterFirst);
  });
});
