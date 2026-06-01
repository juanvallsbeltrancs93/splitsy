import type { MockWebServer } from '@tests/MockWebServer';
import { TEST_BASE_URL } from '@tests/mocks/api';

export const rawTokenResponse = {
  access_token: 'tok123',
  refresh_token: 'refresh-abc',
  token_type: 'bearer',
};

export const rawUserResponse = {
  id: 'uuid-1',
  name: 'Test User',
  email: 'test@test.com',
};

export function givenLoginSuccess(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'post',
    url: `${TEST_BASE_URL}/auth/token`,
    response: rawTokenResponse,
    code: 0
  }]);
}

export function givenLoginError(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'post',
    url: `${TEST_BASE_URL}/auth/token`,
    response: { detail: 'Invalid credentials' },
    code: 401,
  }]);
}

export function givenRegisterSuccess(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'post',
    url: `${TEST_BASE_URL}/auth/register`,
    response: rawUserResponse,
    code: 0
  }]);
}

export function givenRegisterError(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'post',
    url: `${TEST_BASE_URL}/auth/register`,
    response: { detail: 'Email already registered' },
    code: 400,
  }]);
}
