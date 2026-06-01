import type { SettlementRepository } from '../../domain/settlement/repository/SettlementRepository';
import type {
  CreateSettlementParams,
  ListSettlementsParams,
} from '../../domain/settlement/repository/types';
import { Settlement } from '../../domain/settlement/entities/Settlement';
import type { SettlementsApi } from '../apis/settlements/settlementsApi';
import type { SettlementResponseDto } from '../apis/settlements/types';
import { translateApiError } from '../shared/translateApiError';

function mapSettlement(dto: SettlementResponseDto): Settlement {
  return Settlement.create({
    id: dto.id,
    groupId: dto.group_id,
    fromParticipantId: dto.from_participant_id,
    toParticipantId: dto.to_participant_id,
    amount: dto.amount,
    date: dto.date,
    note: dto.note ?? undefined,
  });
}

export class SettlementsApiRepository implements SettlementRepository {
  constructor(private readonly api: SettlementsApi) {}

  async createSettlement(params: CreateSettlementParams): Promise<Settlement> {
    try {
      const dto = await this.api.create(params.groupId, {
        from_participant_id: params.body.fromParticipantId,
        to_participant_id: params.body.toParticipantId,
        amount: params.body.amount,
        date: params.body.date,
        note: params.body.note,
      });
      return mapSettlement(dto);
    } catch (error) {
      translateApiError(error, 'Settlement');
    }
  }

  async listSettlements(params: ListSettlementsParams): Promise<Settlement[]> {
    try {
      const dtos = await this.api.list(params.groupId);
      return dtos.map(mapSettlement);
    } catch (error) {
      translateApiError(error, 'Settlement');
    }
  }
}
