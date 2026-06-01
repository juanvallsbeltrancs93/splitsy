import type { UserBalance } from '@/domain/group/entities/UserBalance';

export interface SettlementPlanItem {
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
}

export function calculateSettlementPlan(balances: UserBalance[]): SettlementPlanItem[] {
  const plan: SettlementPlanItem[] = [];

  // Separate creditors (positive) and debtors (negative)
  const creditors = balances
    .filter((b) => b.balance > 0)
    .map((b) => ({ participantId: b.participantId.value, balance: b.balance }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ participantId: b.participantId.value, balance: Math.abs(b.balance) }))
    .sort((a, b) => b.balance - a.balance);

  let i = 0; // debtor index
  let j = 0; // creditor index

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const payment = Math.min(debtor.balance, creditor.balance);

    plan.push({
      fromParticipantId: debtor.participantId,
      toParticipantId: creditor.participantId,
      amount: payment,
    });

    debtor.balance -= payment;
    creditor.balance -= payment;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return plan;
}
