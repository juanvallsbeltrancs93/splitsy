import { mockSettlementRepository } from '@tests/fakeRepositories';
import { settlementMock } from '../entities/Settlement.test';
import type { CreateSettlementParams, ListSettlementsParams } from '@domain/settlement/repository/types';

export const createSettlementParams: CreateSettlementParams = {
  groupId: '10',
  body: {
    fromParticipantId: '1',
    toParticipantId: '2',
    amount: 25,
    date: '2025-02-01',
    note: 'Paying back',
  },
};

export const listSettlementsParams: ListSettlementsParams = { groupId: '10' };

export function provideHappySettlementRepository() {
  vi.mocked(mockSettlementRepository.createSettlement).mockResolvedValue(settlementMock);
  vi.mocked(mockSettlementRepository.listSettlements).mockResolvedValue([settlementMock]);
  return mockSettlementRepository;
}

export function provideErrorSettlementRepository() {
  const err = new Error('settlement error');
  vi.mocked(mockSettlementRepository.createSettlement).mockRejectedValue(err);
  vi.mocked(mockSettlementRepository.listSettlements).mockRejectedValue(err);
  return mockSettlementRepository;
}
