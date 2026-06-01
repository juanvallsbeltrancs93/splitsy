import './styles.css';
import { BalanceCard } from '../BalanceCard';
import type { BalanceListProps } from './types';

export function BalanceList({ balances, participants, currencyCode }: BalanceListProps) {
  console.log(balances);
  const nonZeroBalances = balances.filter((b) => b.balance !== 0);

  if (nonZeroBalances.length === 0) {
    return <div className="balance-list__empty">No balances yet</div>;
  }

  return (
    <div className="balance-list">
      {nonZeroBalances.map((balance) => (
        <BalanceCard
          key={balance.participantId.value}
          participantId={balance.participantId.value}
          balance={balance.balance}
          participants={participants}
          currencyCode={currencyCode}
        />
      ))}
    </div>
  );
}
