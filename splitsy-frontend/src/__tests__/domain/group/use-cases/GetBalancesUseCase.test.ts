import { GetBalancesUseCase } from '@domain/group/use-cases/GetBalancesUseCase';
import { userBalanceMock } from '../entities/UserBalance.test';
import { getBalancesParams, provideHappyGroupRepository, provideErrorGroupRepository } from './GroupUseCases.fixtures';

describe('Tests on GetBalancesUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return balances on success', async () => {
    const repo = provideHappyGroupRepository();
    const result = await new GetBalancesUseCase(repo).execute(getBalancesParams);
    expect(repo.getBalances).toHaveBeenCalledWith(getBalancesParams);
    expect(result).toEqual([userBalanceMock]);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorGroupRepository();
    await expect(new GetBalancesUseCase(repo).execute(getBalancesParams)).rejects.toThrow();
  });
});
