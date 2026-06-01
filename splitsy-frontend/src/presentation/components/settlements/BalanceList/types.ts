import type { UserBalance } from '../../../../domain/group/entities/UserBalance';
import type { Participant } from '../../../../domain/group/entities/Participant';

export interface BalanceListProps {
  balances: UserBalance[];
  participants: Participant[];
  currencyCode: string;
}
