import type { MockWebServer } from '@tests/MockWebServer';
import { TEST_BASE_URL } from '@tests/mocks/api';

export const rawGroupResponse = {
  id: 'uuid-1',
  name: 'Test Group',
  owner_id: 'user-1',
  participants: [{ id: 'part-1', display_name: 'Alice', type: 'REGISTERED', user_id: 'user-1' }],
};

export const rawGroupResponseWithoutOwnerId = {
  id: 'uuid-2',
  name: 'Test Group No Owner',
  participants: [{ id: 'part-2', display_name: 'Bob', type: 'REGISTERED', user_id: 'user-2' }],
};

export const rawBalancesResponse = [
  { participant_id: 'part-1', balance: 25.50 },
];

export function givenListGroupsSuccess(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/groups`,
    response: [rawGroupResponse],
  }]);
}

export function givenCreateGroupSuccess(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'post',
    url: `${TEST_BASE_URL}/groups`,
    response: rawGroupResponse,
  }]);
}

export function givenGetGroupSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/groups/${groupId}`,
    response: rawGroupResponse,
  }]);
}

export function givenUpdateGroupSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'patch',
    url: `${TEST_BASE_URL}/groups/${groupId}`,
    response: rawGroupResponse,
  }]);
}

export function givenDeleteGroupSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'delete',
    url: `${TEST_BASE_URL}/groups/${groupId}`,
    response: {},
    code: 204,
  }]);
}

export function givenAddParticipantSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'post',
    url: `${TEST_BASE_URL}/groups/${groupId}/participants`,
    response: rawGroupResponse,
  }]);
}

export function givenRemoveParticipantSuccess(server: MockWebServer, groupId: string, participantId: string) {
  server.addRequestHandlers([{
    method: 'delete',
    url: `${TEST_BASE_URL}/groups/${groupId}/participants/${participantId}`,
    response: rawGroupResponse,
  }]);
}

export function givenGetBalancesSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/groups/${groupId}/balances`,
    response: rawBalancesResponse,
  }]);
}

export function givenGetGroupWithOwnerIdSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/groups/${groupId}`,
    response: { ...rawGroupResponse, owner_id: 'user-1' },
  }]);
}

export function givenGetGroupWithoutOwnerIdSuccess(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/groups/${groupId}`,
    response: rawGroupResponseWithoutOwnerId,
  }]);
}

export function givenListGroupsError(server: MockWebServer) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/groups`,
    response: { detail: 'Unauthorized' },
    code: 401,
  }]);
}

export function givenGetBalancesError(server: MockWebServer, groupId: string) {
  server.addRequestHandlers([{
    method: 'get',
    url: `${TEST_BASE_URL}/groups/${groupId}/balances`,
    response: { detail: 'Not found' },
    code: 404,
  }]);
}
