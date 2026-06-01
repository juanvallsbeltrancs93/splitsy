import { GetMeUseCase } from '@domain/users/use-cases/GetMeUseCase';
import { userMock } from '../entities/User.test';
import {
  getMeParams,
  provideHappyUserRepository,
  provideErrorUserRepository,
} from './UserUseCases.fixtures';

describe('Tests on GetMeUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return the current user on success', async () => {
    const repo = provideHappyUserRepository();
    const useCase = new GetMeUseCase(repo);
    const result = await useCase.execute(getMeParams);
    expect(repo.getMe).toHaveBeenCalledWith(getMeParams);
    expect(result).toEqual(userMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorUserRepository();
    const useCase = new GetMeUseCase(repo);
    await expect(useCase.execute(getMeParams)).rejects.toThrow();
  });
});
