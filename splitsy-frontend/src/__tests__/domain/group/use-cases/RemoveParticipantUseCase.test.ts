import { RemoveParticipantUseCase } from '@domain/group/use-cases/RemoveParticipantUseCase';
import { groupMock } from '../entities/Group.test';
import { removeParticipantParams, provideHappyGroupRepository, provideErrorGroupRepository } from './GroupUseCases.fixtures';

describe('Tests on RemoveParticipantUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return group on success', async () => {
    const repo = provideHappyGroupRepository();
    const result = await new RemoveParticipantUseCase(repo).execute(removeParticipantParams);
    expect(repo.removeParticipant).toHaveBeenCalledWith(removeParticipantParams);
    expect(result).toEqual(groupMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorGroupRepository();
    await expect(new RemoveParticipantUseCase(repo).execute(removeParticipantParams)).rejects.toThrow();
  });
});
