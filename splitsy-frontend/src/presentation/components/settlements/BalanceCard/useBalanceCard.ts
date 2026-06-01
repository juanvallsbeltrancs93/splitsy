import type { BalanceCardProps, UseBalanceCardReturn } from './types';

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

export function useBalanceCard({ participantId, balance, participants, currencyCode }: BalanceCardProps): UseBalanceCardReturn {
  const participant = participants.find((p) => p.id === participantId);
  const name = participant?.displayName ?? 'Unknown';
  const firstLetter = name.charAt(0).toUpperCase();
  const isPositive = balance >= 0;
  const formattedAmount = Math.abs(balance).toFixed(2);
  const symbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode;

  return { name, firstLetter, isPositive, formattedAmount, symbol, isDisabled: participant != null && !participant.isActive };
}
