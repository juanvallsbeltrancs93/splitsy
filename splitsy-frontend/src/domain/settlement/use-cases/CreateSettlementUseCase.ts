import type { SettlementRepository } from '../repository/SettlementRepository';
import type { Settlement } from '../entities/Settlement';
import type { CreateSettlementParams } from '../repository/types';

export class CreateSettlementUseCase {
  constructor(private settlementRepository: SettlementRepository) {}

  async execute(props: CreateSettlementParams): Promise<Settlement> {
    try {
      return await this.settlementRepository.createSettlement(props);
    } catch (error) {
      throw new Error(`Error creating settlement: ${error}`);
    }
  }
}
