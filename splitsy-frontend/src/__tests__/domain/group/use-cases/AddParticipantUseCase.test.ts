import { AddParticipantUseCase } from '@domain/group/use-cases/AddParticipantUseCase';
import { groupMock } from '../entities/Group.test';
import { addParticipantParams, provideHappyGroupRepository, provideErrorGroupRepository } from './GroupUseCases.fixtures';

describe('Tests on AddParticipantUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return group on success', async () => {
    const repo = provideHappyGroupRepository();
    const result = await new AddParticipantUseCase(repo).execute(addParticipantParams);
    expect(repo.addParticipant).toHaveBeenCalledWith(addParticipantParams);
    expect(result).toEqual(groupMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorGroupRepository();
    await expect(new AddParticipantUseCase(repo).execute(addParticipantParams)).rejects.toThrow();
  });
});
