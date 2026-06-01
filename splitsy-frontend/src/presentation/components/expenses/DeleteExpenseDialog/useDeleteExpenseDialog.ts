import { useCallback } from 'react';
import { useAuth } from '../../../utils/hooks/useAuth';
import type { UseDeleteExpenseDialogProps } from './types';

export function useDeleteExpenseDialog({ expenseId, onSuccess, onClose }: UseDeleteExpenseDialogProps) {
  const { compositionRoot } = useAuth();

  const handleConfirm = useCallback(async () => {
    try {
      await compositionRoot!.useCases.expenses.delete.execute({ expenseId });
      onSuccess();
    } catch (err) {
      console.error('[DeleteExpenseDialog] Failed to delete expense:', err);
    } finally {
      onClose();
    }
  }, [compositionRoot, expenseId, onSuccess, onClose]);

  return { handleConfirm };
}
