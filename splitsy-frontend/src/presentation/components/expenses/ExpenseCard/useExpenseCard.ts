import { CURRENCIES } from '../../../data/currencies';
import type { ExpenseCardProps, UseExpenseCardReturn } from './types';

export function useExpenseCard({
  expense,
  participants,
  currencyCode,
}: Pick<ExpenseCardProps, 'expense' | 'participants' | 'currencyCode'>): UseExpenseCardReturn {
  const payer = participants.find((p) => p.id === expense.paidBy.value);
  const payerName = payer?.displayName ?? 'Unknown';
  const symbol = CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? currencyCode;

  return { payerName, symbol };
}
