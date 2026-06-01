import { SettlementCard } from '../SettlementCard';
import './styles.css';
import type { SettlementListProps } from './types';

export function SettlementList({ settlements, participants }: SettlementListProps) {
  if (settlements.length === 0) {
    return (
      <div className="settlement-list__empty">
        <span className="settlement-list__empty-title">
          No debts — you're all settled up! 🎉
        </span>
      </div>
    );
  }

  return (
    <div className="settlement-list">
      {settlements.map((settlement) => (
        <SettlementCard
          key={settlement.id.value}
          settlement={settlement}
          participants={participants}
        />
      ))}
    </div>
  );
}
