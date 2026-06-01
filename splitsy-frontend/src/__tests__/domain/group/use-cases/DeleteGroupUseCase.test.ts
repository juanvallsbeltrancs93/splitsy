import { DeleteGroupUseCase } from '@domain/group/use-cases/DeleteGroupUseCase';
import { deleteGroupParams, provideHappyGroupRepository, provideErrorGroupRepository } from './GroupUseCases.fixtures';

describe('Tests on DeleteGroupUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should call deleteGroup on success', async () => {
    const repo = provideHappyGroupRepository();
    await new DeleteGroupUseCase(repo).execute(deleteGroupParams);
    expect(repo.deleteGroup).toHaveBeenCalledWith(deleteGroupParams);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorGroupRepository();
    await expect(new DeleteGroupUseCase(repo).execute(deleteGroupParams)).rejects.toThrow();
  });
});
