import './styles.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDeleteExpenseDialog } from './useDeleteExpenseDialog';
import type { DeleteExpenseDialogProps } from './types';

export function DeleteExpenseDialog(props: DeleteExpenseDialogProps) {
  const { open, expenseId, expenseName, onSuccess, onClose } = props;
  const { handleConfirm } = useDeleteExpenseDialog({ expenseId, onSuccess, onClose });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete expense?</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{expenseName}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions className="delete-expense-dialog__actions" disableSpacing>
        <Button
          className="delete-expense-dialog__btn"
          onClick={onClose}
          variant="text"
        >
          Cancel
        </Button>
        <Button
          className="delete-expense-dialog__btn"
          onClick={handleConfirm}
          variant="contained"
          color="error"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
