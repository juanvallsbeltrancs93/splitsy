import { useBalanceCard } from './useBalanceCard';
import { ParticipantItem } from '../../shared/ParticipantItem';
import type { BalanceCardProps } from './types';

export function BalanceCard({ participantId, balance, participants, currencyCode }: BalanceCardProps) {
  const { name, firstLetter, isPositive, formattedAmount, symbol, isDisabled } = useBalanceCard({
    participantId,
    balance,
    participants,
    currencyCode,
  });

  return (
    <ParticipantItem
      name={name}
      firstLetter={firstLetter}
      amount={formattedAmount}
      prefix={isPositive ? '+' : '-'}
      currencySymbol={symbol}
      variant={isPositive ? 'positive' : 'negative'}
      isDisabled={isDisabled}
    />
  );
}
