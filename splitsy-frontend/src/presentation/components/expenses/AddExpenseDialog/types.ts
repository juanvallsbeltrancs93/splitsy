import type { Expense } from '../../../../domain/expense/entities/Expense';
import type { Group } from '../../../../domain/group/entities/Group';
import type { Participant } from '../../../../domain/group/entities/Participant';

export type SplitMode = 'equally' | 'by_amounts';

export interface SplitState {
  checked: boolean;
  amount: string;
}

export interface AddExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onExpenseCreated: (expense: Expense) => void;
  initialExpense?: Expense;
  group: Group;
}

export interface UseAddExpenseDialogReturn {
  isLoading: boolean;
  title: string;
  titleError: string | null;
  amount: string;
  amountError: string | null;
  paidBy: string;
  splits: Record<string, SplitState>;
  participants: Participant[];
  currencyCode: string;
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
