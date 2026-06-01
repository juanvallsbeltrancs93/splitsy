import { GetGroupUseCase } from '@domain/group/use-cases/GetGroupUseCase';
import { groupMock } from '../entities/Group.test';
import { getGroupParams, provideHappyGroupRepository, provideErrorGroupRepository } from './GroupUseCases.fixtures';

describe('Tests on GetGroupUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return a group on success', async () => {
    const repo = provideHappyGroupRepository();
    const result = await new GetGroupUseCase(repo).execute(getGroupParams);
    expect(repo.getGroup).toHaveBeenCalledWith(getGroupParams);
    expect(result).toEqual(groupMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorGroupRepository();
    await expect(new GetGroupUseCase(repo).execute(getGroupParams)).rejects.toThrow();
  });
});
