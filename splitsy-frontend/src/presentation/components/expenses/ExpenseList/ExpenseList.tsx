import { ExpenseCard } from '../ExpenseCard';
import './styles.css';
import type { ExpenseListProps } from './types';

export function ExpenseList({ expenses, participants, currencyCode, onExpenseClick, onDeleteExpense, onEditExpense, onDuplicateExpense }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="expense-list__empty">
        <span className="expense-list__empty-title">No expenses yet</span>
        <span className="expense-list__empty-subtitle">
          Add your first expense to start tracking
        </span>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id.value}
            expense={expense}
            participants={participants}
            currencyCode={currencyCode}
            onClick={() => onExpenseClick(expense)}
            onDelete={onDeleteExpense}
            onEdit={onEditExpense}
            onDuplicate={onDuplicateExpense}
          />
      ))}
    </div>
  );
}
