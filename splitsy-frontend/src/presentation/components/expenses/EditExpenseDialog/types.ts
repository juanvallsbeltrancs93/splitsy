import type { Expense } from '../../../../domain/expense/entities/Expense';
import type { Participant } from '../../../../domain/group/entities/Participant';
import type { SplitMode, SplitState } from '../AddExpenseDialog/types';

export type { SplitMode, SplitState };

export interface EditExpenseDialogProps {
  open: boolean;
  expense: Expense | null;
  participants: Participant[];
  currencyCode: string;
  onClose: () => void;
  onSuccess: (updatedExpense: Expense) => void;
}

export interface UseEditExpenseDialogReturn {
  isLoading: boolean;
  title: string;
  titleError: string | null;
  amount: string;
  amountError: string | null;
  paidBy: string;
  splits: Record<string, SplitState>;
  currencySymbol: string;
  submitError: string | null;
  splitMode: SplitMode;
  fullScreen: boolean;
  onTitleChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onPaidByChange: (v: string) => void;
  onToggleSplit: (participantId: string) => void;
  onSplitAmountChange: (participantId: string, value: string) => void;
  onSplitModeChange: (mode: SplitMode) => void;
  onSubmit: () => void;
}
