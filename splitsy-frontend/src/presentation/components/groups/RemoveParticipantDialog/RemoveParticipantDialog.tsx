import './styles.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { useRemoveParticipantDialog } from './useRemoveParticipantDialog';
import type { RemoveParticipantDialogProps } from './types';

export function RemoveParticipantDialog(props: RemoveParticipantDialogProps) {
  const { open, participant, onClose } = props;
  const { isLoading, isSelf, submitError, onConfirm } = useRemoveParticipantDialog(props);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Remove participant</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isSelf
            ? 'You are about to remove yourself from this group. You will lose access and be redirected to your groups page.'
            : `Are you sure you want to remove ${participant?.displayName ?? ''} from this group?`}
        </DialogContentText>
        {submitError && (
          <Alert severity="error" className="remove-participant-dialog__error">
            {submitError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={isLoading}>
          Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
}
