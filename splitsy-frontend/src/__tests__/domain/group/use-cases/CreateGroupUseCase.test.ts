import { CreateGroupUseCase } from '@domain/group/use-cases/CreateGroupUseCase';
import { groupMock } from '../entities/Group.test';
import { createGroupParams, provideHappyGroupRepository, provideErrorGroupRepository } from './GroupUseCases.fixtures';

describe('Tests on CreateGroupUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return a group on success', async () => {
    const repo = provideHappyGroupRepository();
    const result = await new CreateGroupUseCase(repo).execute(createGroupParams);
    expect(repo.createGroup).toHaveBeenCalledWith(createGroupParams);
    expect(result).toEqual(groupMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorGroupRepository();
    await expect(new CreateGroupUseCase(repo).execute(createGroupParams)).rejects.toThrow();
  });
});
