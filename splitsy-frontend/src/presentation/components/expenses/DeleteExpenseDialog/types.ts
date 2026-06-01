export interface DeleteExpenseDialogProps {
  open: boolean;
  expenseId: string;
  expenseName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export interface UseDeleteExpenseDialogProps {
  expenseId: string;
  onSuccess: () => void;
  onClose: () => void;
}
