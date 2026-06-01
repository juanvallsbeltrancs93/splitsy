import { ListGroupsUseCase } from '@domain/group/use-cases/ListGroupsUseCase';
import { groupMock } from '../entities/Group.test';
import { listGroupsParams, provideHappyGroupRepository, provideErrorGroupRepository } from './GroupUseCases.fixtures';

describe('Tests on ListGroupsUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return groups on success', async () => {
    const repo = provideHappyGroupRepository();
    const result = await new ListGroupsUseCase(repo).execute(listGroupsParams);
    expect(repo.listGroups).toHaveBeenCalledWith(listGroupsParams);
    expect(result).toEqual([groupMock]);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorGroupRepository();
    await expect(new ListGroupsUseCase(repo).execute(listGroupsParams)).rejects.toThrow();
  });
});
