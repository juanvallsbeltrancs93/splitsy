import { GroupsApi } from '@data/apis/groups/groupsApi';
import { GroupsApiRepository } from '@data/group/GroupsApiRepository';
import { Group } from '@domain/group/entities/Group';
import { UserBalance } from '@domain/group/entities/UserBalance';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';
import {
  givenListGroupsSuccess,
  givenListGroupsError,
  givenCreateGroupSuccess,
  givenGetGroupSuccess,
  givenUpdateGroupSuccess,
  givenDeleteGroupSuccess,
  givenAddParticipantSuccess,
  givenRemoveParticipantSuccess,
  givenGetBalancesSuccess,
  givenGetBalancesError,
  givenGetGroupWithOwnerIdSuccess,
  givenGetGroupWithoutOwnerIdSuccess,
} from './HttpGroupRepository.fixtures';

const mockWebServer = new MockWebServer();
const GROUP_ID = 'uuid-1';
const PARTICIPANT_ID = 'part-1';

function createRepo() {
  return new GroupsApiRepository(new GroupsApi(provideApi()));
}

describe('Tests on GroupsApiRepository', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should return Group[] on listGroups', async () => {
    givenListGroupsSuccess(mockWebServer);
    const result = await createRepo().listGroups({});
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Group);
  });

  it('should throw on listGroups with 401', async () => {
    givenListGroupsError(mockWebServer);
    await expect(createRepo().listGroups({})).rejects.toThrow();
  });

  it('should return Group on createGroup', async () => {
    givenCreateGroupSuccess(mockWebServer);
    const result = await createRepo().createGroup({ body: { name: 'Test Group' } });
    expect(result).toBeInstanceOf(Group);
    expect(result.name).toBe('Test Group');
  });

  it('should return Group with correct id on getGroup', async () => {
    givenGetGroupSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().getGroup({ groupId: GROUP_ID });
    expect(result).toBeInstanceOf(Group);
    expect(result.id).toBe(GROUP_ID);
  });

  it('should return updated Group on updateGroup', async () => {
    givenUpdateGroupSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().updateGroup({ groupId: GROUP_ID, body: { name: 'Updated' } });
    expect(result).toBeInstanceOf(Group);
  });

  it('should resolve without throwing on deleteGroup', async () => {
    givenDeleteGroupSuccess(mockWebServer, GROUP_ID);
    await expect(createRepo().deleteGroup({ groupId: GROUP_ID })).resolves.toBeUndefined();
  });

  it('should return updated Group on addParticipant', async () => {
    givenAddParticipantSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().addParticipant({ groupId: GROUP_ID, body: { type: 'REGISTERED', user_id: 'user-2' } });
    expect(result).toBeInstanceOf(Group);
  });

  it('should return updated Group on removeParticipant', async () => {
    givenRemoveParticipantSuccess(mockWebServer, GROUP_ID, PARTICIPANT_ID);
    const result = await createRepo().removeParticipant({ groupId: GROUP_ID, participantId: PARTICIPANT_ID });
    expect(result).toBeInstanceOf(Group);
  });

  it('should return UserBalance[] on getBalances', async () => {
    givenGetBalancesSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().getBalances({ groupId: GROUP_ID });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(UserBalance);
    expect(result[0].balance).toBe(25.5);
  });

  it('should throw on getBalances with 404', async () => {
    givenGetBalancesError(mockWebServer, GROUP_ID);
    await expect(createRepo().getBalances({ groupId: GROUP_ID })).rejects.toThrow();
  });

  it('should map owner_id to ownerId on group when present', async () => {
    givenGetGroupWithOwnerIdSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().getGroup({ groupId: GROUP_ID });
    expect(result.ownerId).toBe('user-1');
  });

  it('should fallback ownerId to empty string when owner_id is absent', async () => {
    givenGetGroupWithoutOwnerIdSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().getGroup({ groupId: GROUP_ID });
    expect(result.ownerId).toBe('');
  });
});
