import type { Participant } from '../../../../domain/group/entities/Participant';

export interface BalanceCardProps {
  participantId: string;
  balance: number;
  participants: Participant[];
  currencyCode: string;
}

export interface UseBalanceCardReturn {
  name: string;
  firstLetter: string;
  isPositive: boolean;
  formattedAmount: string;
  symbol: string;
  isDisabled: boolean;
}
