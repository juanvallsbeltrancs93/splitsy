import type { MockWebServer } from '@tests/MockWebServer';
import { TEST_BASE_URL } from '@tests/mocks/api';

export const rawUserResponse = {
  id: 'uuid-1',
  name: 'Test User',
  email: 'test@test.com',
};

export function givenGetMeSuccess(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/users/me`,
    response: rawUserResponse,
  }]);
}

export function givenGetMeError(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/users/me`,
    response: { detail: 'Unauthorized' },
    code: 401,
  }]);
}
