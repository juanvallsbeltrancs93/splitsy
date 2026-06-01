import { UpdateGroupUseCase } from '@domain/group/use-cases/UpdateGroupUseCase';
import { groupMock } from '../entities/Group.test';
import { updateGroupParams, provideHappyGroupRepository, provideErrorGroupRepository } from './GroupUseCases.fixtures';

describe('Tests on UpdateGroupUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return updated group on success', async () => {
    const repo = provideHappyGroupRepository();
    const result = await new UpdateGroupUseCase(repo).execute(updateGroupParams);
    expect(repo.updateGroup).toHaveBeenCalledWith(updateGroupParams);
    expect(result).toEqual(groupMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorGroupRepository();
    await expect(new UpdateGroupUseCase(repo).execute(updateGroupParams)).rejects.toThrow();
  });
});
