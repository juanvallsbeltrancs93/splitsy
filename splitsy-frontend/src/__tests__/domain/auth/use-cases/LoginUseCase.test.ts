import { LoginUseCase } from '@domain/auth/use-cases/LoginUseCase';
import { tokenMock } from '../entities/Token.test';
import {
  loginParams,
  provideHappyAuthRepository,
  provideErrorAuthRepository,
} from './AuthUseCases.fixtures';

describe('Tests on LoginUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return a token on success', async () => {
    const repo = provideHappyAuthRepository();
    const useCase = new LoginUseCase(repo);
    const result = await useCase.execute(loginParams);
    expect(repo.login).toHaveBeenCalledWith(loginParams);
    expect(result).toEqual(tokenMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorAuthRepository();
    const useCase = new LoginUseCase(repo);
    await expect(useCase.execute(loginParams)).rejects.toThrow();
  });
});
