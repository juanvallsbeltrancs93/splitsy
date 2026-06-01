import './styles.css';
import { useExpenseCard } from './useExpenseCard';
import { ExpenseActionsMenu } from '../ExpenseActionsMenu';
import type { ExpenseCardProps } from './types';

export function ExpenseCard({ expense, participants, currencyCode, onClick, onDelete, onEdit, onDuplicate }: ExpenseCardProps) {
  const { payerName, symbol } = useExpenseCard({ expense, participants, currencyCode });

  return (
    <button className="expense-card" type="button" onClick={onClick}>
      <div className="expense-card__content">
        <span className="expense-card__name">{expense.name}</span>
        <span className="expense-card__paid-by">Paid by {payerName}</span>
      </div>
      <div className="expense-card__right">
        <span className="expense-card__amount">
          {symbol}{expense.amount}
        </span>
        <ExpenseActionsMenu
          onEdit={() => onEdit?.(expense)}
          onDelete={() => onDelete?.(expense)}
          onDuplicate={onDuplicate ? () => onDuplicate(expense) : undefined}
        />
      </div>
    </button>
  );
}
