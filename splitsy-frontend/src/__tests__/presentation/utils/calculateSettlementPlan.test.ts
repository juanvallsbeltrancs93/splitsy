import { describe, it, expect } from 'vitest';
import { calculateSettlementPlan } from '@/presentation/utils/calculateSettlementPlan';
import { UserBalance } from '@/domain/group/entities/UserBalance';

function balance(participantId: string, amount: number): UserBalance {
  return UserBalance.create({ participantId, balance: amount });
}

describe('calculateSettlementPlan', () => {
  it('should return empty plan when all balances are zero', () => {
    const balances = [
      balance('p1', 0),
      balance('p2', 0),
    ];
    const plan = calculateSettlementPlan(balances);
    expect(plan).toEqual([]);
  });

  it('should return empty plan when creditors and debtors are balanced', () => {
    const balances = [
      balance('p1', 10),
      balance('p2', -10),
    ];
    const plan = calculateSettlementPlan(balances);
    expect(plan).toEqual([
      { fromParticipantId: 'p2', toParticipantId: 'p1', amount: 10 },
    ]);
  });

  it('should handle simple two-person settlement', () => {
    const balances = [
      balance('p1', 50),
      balance('p2', -50),
    ];
    const plan = calculateSettlementPlan(balances);
    expect(plan).toEqual([
      { fromParticipantId: 'p2', toParticipantId: 'p1', amount: 50 },
    ]);
  });

  it('should handle one debtor paying multiple creditors', () => {
    const balances = [
      balance('p1', 30),
      balance('p2', 20),
      balance('p3', -50),
    ];
    const plan = calculateSettlementPlan(balances);
    expect(plan).toEqual([
      { fromParticipantId: 'p3', toParticipantId: 'p1', amount: 30 },
      { fromParticipantId: 'p3', toParticipantId: 'p2', amount: 20 },
    ]);
  });

  it('should handle multiple debtors paying one creditor', () => {
    const balances = [
      balance('p1', 50),
      balance('p2', -30),
      balance('p3', -20),
    ];
    const plan = calculateSettlementPlan(balances);
    expect(plan).toEqual([
      { fromParticipantId: 'p2', toParticipantId: 'p1', amount: 30 },
      { fromParticipantId: 'p3', toParticipantId: 'p1', amount: 20 },
    ]);
  });

  it('should handle complex multi-party settlement', () => {
    const balances = [
      balance('p1', 40),
      balance('p2', 10),
      balance('p3', -30),
      balance('p4', -20),
    ];
    const plan = calculateSettlementPlan(balances);
    expect(plan).toEqual([
      { fromParticipantId: 'p3', toParticipantId: 'p1', amount: 30 },
      { fromParticipantId: 'p4', toParticipantId: 'p1', amount: 10 },
      { fromParticipantId: 'p4', toParticipantId: 'p2', amount: 10 },
    ]);
  });

  it('should handle partial payments when amounts do not match exactly', () => {
    const balances = [
      balance('p1', 25),
      balance('p2', -40),
      balance('p3', 15),
    ];
    const plan = calculateSettlementPlan(balances);
    expect(plan).toEqual([
      { fromParticipantId: 'p2', toParticipantId: 'p1', amount: 25 },
      { fromParticipantId: 'p2', toParticipantId: 'p3', amount: 15 },
    ]);
  });

  it('should ignore zero-balance participants', () => {
    const balances = [
      balance('p1', 0),
      balance('p2', 20),
      balance('p3', -20),
      balance('p4', 0),
    ];
    const plan = calculateSettlementPlan(balances);
    expect(plan).toEqual([
      { fromParticipantId: 'p3', toParticipantId: 'p2', amount: 20 },
    ]);
  });
});
