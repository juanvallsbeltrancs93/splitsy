import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { useRecordSettlementDialog } from './useRecordSettlementDialog';
import type { RecordSettlementDialogProps } from './types';
import './styles.css';

export function RecordSettlementDialog(props: RecordSettlementDialogProps) {
  const {
    isLoading,
    note,
    date,
    submitError,
    fromName,
    toName,
    amount,
    currencySymbol,
    onNoteChange,
    onDateChange,
    onSubmit,
  } = useRecordSettlementDialog(props);

  const { open, onClose } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <div className="record-settlement-dialog__title-row">
          <span>Record Payment</span>
          <IconButton onClick={onClose} aria-label="Close">
            ✕
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent>
        <div className="record-settlement-dialog__form">
          <div className="record-settlement-dialog__summary">
            <span className="record-settlement-dialog__names">
              {fromName} → {toName}
            </span>
            <span className="record-settlement-dialog__amount">
              {currencySymbol}{amount.toFixed(2)}
            </span>
          </div>

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={onDateChange}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="Note (optional)"
            value={note}
            onChange={onNoteChange}
            fullWidth
            multiline
            rows={2}
          />

          {submitError && <Alert severity="error">{submitError}</Alert>}
        </div>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onSubmit} disabled={isLoading}>
          Record Payment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
