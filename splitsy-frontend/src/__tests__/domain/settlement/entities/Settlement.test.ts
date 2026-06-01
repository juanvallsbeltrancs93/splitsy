import { Settlement } from '@domain/settlement/entities/Settlement';
import type { SettlementProps } from '@domain/settlement/entities/Settlement';

export const settlementPropsMock: SettlementProps = {
  id: '200',
  groupId: '10',
  fromParticipantId: '1',
  toParticipantId: '2',
  amount: 25,
  date: '2025-02-01',
  note: 'Paying back dinner',
};

export const settlementMock = Settlement.create(settlementPropsMock);

describe('Tests on Settlement entity', () => {
  it('should create a Settlement with all fields', () => {
    const s = Settlement.create(settlementPropsMock);
    expect(s.id.value).toBe('200');
    expect(s.groupId.value).toBe('10');
    expect(s.fromParticipantId.value).toBe('1');
    expect(s.toParticipantId.value).toBe('2');
    expect(s.amount).toBe(25);
    expect(s.date).toBe('2025-02-01');
    expect(s.note).toBe('Paying back dinner');
  });

  it('should handle optional note as undefined', () => {
    const { note: _, ...propsNoNote } = settlementPropsMock;
    const s = Settlement.create(propsNoNote);
    expect(s.note).toBeUndefined();
  });

  it('should create without id (generates one)', () => {
    const { id: _, ...propsNoId } = settlementPropsMock;
    const s = Settlement.create(propsNoId);
    expect(s.id.value).toBeDefined();
    expect(s.id.value.length).toBeGreaterThan(0);
  });
});
