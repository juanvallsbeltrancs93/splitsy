import { ListSettlementsUseCase } from '@domain/settlement/use-cases/ListSettlementsUseCase';
import { settlementMock } from '../entities/Settlement.test';
import { listSettlementsParams, provideHappySettlementRepository, provideErrorSettlementRepository } from './SettlementUseCases.fixtures';

describe('Tests on ListSettlementsUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return settlements on success', async () => {
    const repo = provideHappySettlementRepository();
    const result = await new ListSettlementsUseCase(repo).execute(listSettlementsParams);
    expect(repo.listSettlements).toHaveBeenCalledWith(listSettlementsParams);
    expect(result).toEqual([settlementMock]);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorSettlementRepository();
    await expect(new ListSettlementsUseCase(repo).execute(listSettlementsParams)).rejects.toThrow();
  });
});
