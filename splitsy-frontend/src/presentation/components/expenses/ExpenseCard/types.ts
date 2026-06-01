import type { Expense } from '../../../../domain/expense/entities/Expense';
import type { Participant } from '../../../../domain/group/entities/Participant';

export interface ExpenseCardProps {
  expense: Expense;
  participants: Participant[];
  currencyCode: string;
  onClick: () => void;
  onDelete?: (expense: Expense) => void;
  onEdit?: (expense: Expense) => void;
  onDuplicate?: (expense: Expense) => void;
}

export interface UseExpenseCardReturn {
  payerName: string;
  symbol: string;
}
