import type { MockWebServer } from '@tests/MockWebServer';
import { TEST_BASE_URL } from '@tests/mocks/api';

export const rawSettlementResponse = {
  id: 'set-1',
  group_id: 'grp-1',
  from_participant_id: 'user-1',
  to_participant_id: 'user-2',
  amount: 50.0,
  date: '2024-01-15T00:00:00Z',
  note: null,
};

export function givenCreateSettlementSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'post',
    url: `${TEST_BASE_URL}/settlements/group/${groupId}`,
    response: rawSettlementResponse,
  }]);
}

export function givenListSettlementsSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/settlements/group/${groupId}`,
    response: [rawSettlementResponse],
  }]);
}

export function givenListSettlementsError(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/settlements/group/${groupId}`,
    response: { detail: 'Not found' },
    code: 404,
  }]);
}
