import './styles.css';
import { useSettlementCard } from './useSettlementCard';
import type { SettlementCardProps } from './types';

export function SettlementCard({ settlement, participants }: SettlementCardProps) {
  const { fromName, toName, formattedDate } = useSettlementCard({ settlement, participants });

  return (
    <div className="settlement-card">
      <div className="settlement-card__content">
        <span className="settlement-card__names">
          {fromName} → {toName}
        </span>
        <span className="settlement-card__date">{formattedDate}</span>
      </div>
      <span className="settlement-card__amount">
        &euro;{settlement.amount}
      </span>
    </div>
  );
}
