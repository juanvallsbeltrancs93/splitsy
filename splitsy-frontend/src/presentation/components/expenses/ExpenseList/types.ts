import type { Expense } from '../../../../domain/expense/entities/Expense';
import type { Participant } from '../../../../domain/group/entities/Participant';

export interface ExpenseListProps {
  expenses: Expense[];
  participants: Participant[];
  currencyCode: string;
  onExpenseClick: (expense: Expense) => void;
  onDeleteExpense?: (expense: Expense) => void;
  onEditExpense?: (expense: Expense) => void;
  onDuplicateExpense?: (expense: Expense) => void;
}
