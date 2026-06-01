import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { AuthApi } from '@data/apis/auth/authApi';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';

const mockWebServer = new MockWebServer();

function createApi() {
  return new AuthApi(provideApi());
}

function givenLoginError(mockWebServer: MockWebServer, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'post',
    url: 'http://testing-url.com/api/splitsy/v0/auth/token',
    response: { detail: 'Internal server error' },
    code,
  }]);
}

function givenRegisterError(mockWebServer: MockWebServer, code: number) {
  mockWebServer.addRequestHandlers([{
    method: 'post',
    url: 'http://testing-url.com/api/splitsy/v0/auth/register',
    response: { detail: 'Internal server error' },
    code,
  }]);
}

describe('AuthApi', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should return token response on successful login', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/auth/token',
      response: { access_token: 'tok123', refresh_token: 'refresh-abc', token_type: 'bearer' },
      code: 0
    }]);

    const api = createApi();
    const result = await api.login({ username: 'test@test.com', password: 'pass123' });

    expect(result.access_token).toBe('tok123');
    expect(result.refresh_token).toBe('refresh-abc');
    expect(result.token_type).toBe('bearer');
  });

  it('should return token response on successful refresh', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/auth/refresh',
      response: { access_token: 'new-tok456', refresh_token: 'new-refresh-xyz', token_type: 'bearer' },
      code: 0
    }]);

    const api = createApi();
    const result = await api.refresh('old-refresh-token');

    expect(result.access_token).toBe('new-tok456');
    expect(result.refresh_token).toBe('new-refresh-xyz');
    expect(result.token_type).toBe('bearer');
  });

  it('should send refresh request with correct body', async () => {
    let capturedRequest: Request | null = null;
    mockWebServer.addVerificationListener((req) => {
      if (req.url.includes('/auth/refresh')) {
        capturedRequest = req;
      }
    });

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/auth/refresh',
      response: { access_token: 'new-tok456', refresh_token: 'new-refresh-xyz', token_type: 'bearer' },
      code: 0
    }]);

    const api = createApi();
    await api.refresh('old-refresh-token');

    expect(capturedRequest).not.toBeNull();
    const body = await capturedRequest!.json();
    expect(body.refresh_token).toBe('old-refresh-token');
  });

  it('should send login request as multipart form data', async () => {
    let capturedRequest: Request | null = null;
    mockWebServer.addVerificationListener((req) => {
      if (req.url.includes('/auth/token')) {
        capturedRequest = req;
      }
    });

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/auth/token',
      response: { access_token: 'tok123', refresh_token: 'refresh-abc', token_type: 'bearer' },
      code: 0
    }]);

    const api = createApi();
    await api.login({ username: 'test@test.com', password: 'pass123' });

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.headers.get('content-type')).toContain('multipart/form-data');
  });

  it('should return user response on successful register', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/auth/register',
      response: { id: 'uuid-1', name: 'Test User', email: 'test@test.com' },
      code: 0
    }]);

    const api = createApi();
    const result = await api.register({ name: 'Test User', email: 'test@test.com', password: 'pass123' });

    expect(result.id).toBe('uuid-1');
    expect(result.name).toBe('Test User');
    expect(result.email).toBe('test@test.com');
  });

  it('should send correct request body on register', async () => {
    let capturedRequest: Request | null = null;
    mockWebServer.addVerificationListener((req) => {
      if (req.url.includes('/auth/register')) {
        capturedRequest = req;
      }
    });

    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/auth/register',
      response: { id: 'uuid-1', name: 'Test User', email: 'test@test.com' },
      code: 0
    }]);

    const api = createApi();
    await api.register({ name: 'Test User', email: 'test@test.com', password: 'pass123' });

    expect(capturedRequest).not.toBeNull();
    const body = await capturedRequest!.json();
    expect(body.name).toBe('Test User');
    expect(body.email).toBe('test@test.com');
    expect(body.password).toBe('pass123');
  });

  it('should throw on login with 401', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/auth/token',
      response: { detail: 'Invalid credentials' },
      code: 401,
    }]);

    const api = createApi();
    await expect(api.login({ username: 'bad@test.com', password: 'wrong' })).rejects.toThrow();
  });

  it('should throw on register with 422', async () => {
    mockWebServer.addRequestHandlers([{
      method: 'post',
      url: 'http://testing-url.com/api/splitsy/v0/auth/register',
      response: { detail: [{ loc: ['body', 'email'], msg: 'invalid email', type: 'value_error' }] },
      code: 422,
    }]);

    const api = createApi();
    await expect(api.register({ name: 'Test', email: 'invalid', password: 'pass' })).rejects.toThrow();
  });

  it('should throw on login when server returns 500', async () => {
    givenLoginError(mockWebServer, 500);
    const api = createApi();
    await expect(api.login({ username: 'test@test.com', password: 'pass123' })).rejects.toThrow();
  });

  it('should throw on register when server returns 500', async () => {
    givenRegisterError(mockWebServer, 500);
    const api = createApi();
    await expect(api.register({ name: 'Test User', email: 'test@test.com', password: 'pass123' })).rejects.toThrow();
  });
});
