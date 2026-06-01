import type { SettlementRepository } from '../repository/SettlementRepository';
import type { Settlement } from '../entities/Settlement';
import type { ListSettlementsParams } from '../repository/types';

export class ListSettlementsUseCase {
  constructor(private settlementRepository: SettlementRepository) {}

  async execute(props: ListSettlementsParams): Promise<Settlement[]> {
    try {
      return await this.settlementRepository.listSettlements(props);
    } catch (error) {
      throw new Error(`Error listing settlements: ${error}`);
    }
  }
}
