import './styles.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useDeleteGroupDialog } from './useDeleteGroupDialog';
import type { DeleteGroupDialogProps } from './types';

export function DeleteGroupDialog(props: DeleteGroupDialogProps) {
  const { groupId, open, groupName, onClose } = props;
  const { handleConfirm } = useDeleteGroupDialog({ groupId, onClose });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Delete group?</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete <strong>{groupName}</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions className="delete-group-dialog__actions" disableSpacing>
        <Button
          className="delete-group-dialog__btn"
          onClick={onClose}
          variant="text"
        >
          Cancel
        </Button>
        <Button
          className="delete-group-dialog__btn"
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
