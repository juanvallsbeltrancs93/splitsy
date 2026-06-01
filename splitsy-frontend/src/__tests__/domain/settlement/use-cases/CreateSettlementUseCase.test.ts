import { CreateSettlementUseCase } from '@domain/settlement/use-cases/CreateSettlementUseCase';
import { settlementMock } from '../entities/Settlement.test';
import { createSettlementParams, provideHappySettlementRepository, provideErrorSettlementRepository } from './SettlementUseCases.fixtures';

describe('Tests on CreateSettlementUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return settlement on success', async () => {
    const repo = provideHappySettlementRepository();
    const result = await new CreateSettlementUseCase(repo).execute(createSettlementParams);
    expect(repo.createSettlement).toHaveBeenCalledWith(createSettlementParams);
    expect(result).toEqual(settlementMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorSettlementRepository();
    await expect(new CreateSettlementUseCase(repo).execute(createSettlementParams)).rejects.toThrow();
  });
});
