import { RegisterUseCase } from '@domain/auth/use-cases/RegisterUseCase';
import { userMock } from '../../users/entities/User.test';
import {
  registerParams,
  provideHappyAuthRepository,
  provideErrorAuthRepository,
} from './AuthUseCases.fixtures';

describe('Tests on RegisterUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return a user on success', async () => {
    const repo = provideHappyAuthRepository();
    const useCase = new RegisterUseCase(repo);
    const result = await useCase.execute(registerParams);
    expect(repo.register).toHaveBeenCalledWith(registerParams);
    expect(result).toEqual(userMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorAuthRepository();
    const useCase = new RegisterUseCase(repo);
    await expect(useCase.execute(registerParams)).rejects.toThrow();
  });
});
