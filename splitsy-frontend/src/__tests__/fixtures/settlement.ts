import { Settlement } from '@/domain/settlement/entities/Settlement';
import type { SettlementProps } from '@/domain/settlement/entities/Settlement';

export function provideSettlementFixture(data: Partial<SettlementProps> = {}): Settlement {
  return Settlement.create({
    id: 'settlement-1',
    groupId: 'group-1',
    fromParticipantId: 'p2',
    toParticipantId: 'p1',
    amount: 20,
    date: '2024-06-25',
    note: 'Paying back for dinner',
    ...data,
  });
}

export function provideSettlementList(): Settlement[] {
  return [
    provideSettlementFixture({ id: 's1', fromParticipantId: 'p2', toParticipantId: 'p1', amount: 20, date: '2024-06-25' }),
    provideSettlementFixture({ id: 's2', fromParticipantId: 'p3', toParticipantId: 'p2', amount: 15, date: '2024-06-20', note: 'Taxi split' }),
  ];
}
