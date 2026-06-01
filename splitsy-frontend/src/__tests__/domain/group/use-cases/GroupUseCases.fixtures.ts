import { mockGroupRepository } from '@tests/fakeRepositories';
import { groupMock } from '../entities/Group.test';
import { userBalanceMock } from '../entities/UserBalance.test';
import type {
  ListGroupsParams,
  CreateGroupParams,
  GetGroupParams,
  UpdateGroupParams,
  DeleteGroupParams,
  AddParticipantParams,
  RemoveParticipantParams,
  GetBalancesParams,
} from '@domain/group/repository/types';

export const listGroupsParams: ListGroupsParams = {};
export const createGroupParams: CreateGroupParams = { body: { name: 'New Group' } };
export const getGroupParams: GetGroupParams = { groupId: '10' };
export const updateGroupParams: UpdateGroupParams = { groupId: '10', body: { name: 'Updated' } };
export const deleteGroupParams: DeleteGroupParams = { groupId: '10' };
export const addParticipantParams: AddParticipantParams = { groupId: '10', body: { type: 'REGISTERED', user_id: 'user-3' } };
export const removeParticipantParams: RemoveParticipantParams = { groupId: '10', participantId: 'part-3' };
export const getBalancesParams: GetBalancesParams = { groupId: '10' };

export function provideHappyGroupRepository() {
  vi.mocked(mockGroupRepository.listGroups).mockResolvedValue([groupMock]);
  vi.mocked(mockGroupRepository.createGroup).mockResolvedValue(groupMock);
  vi.mocked(mockGroupRepository.getGroup).mockResolvedValue(groupMock);
  vi.mocked(mockGroupRepository.updateGroup).mockResolvedValue(groupMock);
  vi.mocked(mockGroupRepository.deleteGroup).mockResolvedValue(undefined);
  vi.mocked(mockGroupRepository.addParticipant).mockResolvedValue(groupMock);
  vi.mocked(mockGroupRepository.removeParticipant).mockResolvedValue(groupMock);
  vi.mocked(mockGroupRepository.getBalances).mockResolvedValue([userBalanceMock]);
  return mockGroupRepository;
}

export function provideErrorGroupRepository() {
  const err = new Error('group error');
  vi.mocked(mockGroupRepository.listGroups).mockRejectedValue(err);
  vi.mocked(mockGroupRepository.createGroup).mockRejectedValue(err);
  vi.mocked(mockGroupRepository.getGroup).mockRejectedValue(err);
  vi.mocked(mockGroupRepository.updateGroup).mockRejectedValue(err);
  vi.mocked(mockGroupRepository.deleteGroup).mockRejectedValue(err);
  vi.mocked(mockGroupRepository.addParticipant).mockRejectedValue(err);
  vi.mocked(mockGroupRepository.removeParticipant).mockRejectedValue(err);
  vi.mocked(mockGroupRepository.getBalances).mockRejectedValue(err);
  return mockGroupRepository;
}
