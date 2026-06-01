import type { Expense } from '../../../../domain/expense/entities/Expense';
import type { Participant } from '../../../../domain/group/entities/Participant';

export interface ExpenseDetailDialogProps {
  open: boolean;
  expense: Expense | null;
  participants: Participant[];
  currencyCode: string;
  currentUserId: string | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onDelete?: (expense: Expense) => void;
  onEdit?: (expense: Expense) => void;
  onDuplicate?: (expense: Expense) => void;
}

export interface UseExpenseDetailDialogReturn {
  fullScreen: boolean;
  symbol: string;
  payer: Participant | undefined;
  payerName: string;
  payerLetter: string;
  formattedDate: string | null;
  payerOwed: number | string;
}
