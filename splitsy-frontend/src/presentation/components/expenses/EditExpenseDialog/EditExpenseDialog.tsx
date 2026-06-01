import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import { useEditExpenseDialog } from './useEditExpenseDialog';
import type { EditExpenseDialogProps } from './types';
import './styles.css';

export function EditExpenseDialog(props: EditExpenseDialogProps) {
  const {
    isLoading,
    title,
    titleError,
    amount,
    amountError,
    paidBy,
    splits,
    currencySymbol,
    submitError,
    splitMode,
    fullScreen,
    onTitleChange,
    onAmountChange,
    onPaidByChange,
    onToggleSplit,
    onSplitAmountChange,
    onSplitModeChange,
    onSubmit,
  } = useEditExpenseDialog(props);

  const { open, onClose, participants } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <div className="edit-expense-dialog__title-row">
          <span>Edit expense</span>
          <IconButton onClick={onClose} aria-label="Close">
            ✕
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent>
        <div className="edit-expense-dialog__form">
          <TextField
            label="Title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            error={!!titleError}
            helperText={titleError}
            fullWidth
          />

          <div className="edit-expense-dialog__amount-row">
            <TextField
              label="Amount"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              error={!!amountError}
              helperText={amountError}
              slotProps={{
                input: {
                  startAdornment: (
                    <span className="edit-expense-dialog__currency-symbol">{currencySymbol}</span>
                  ),
                  inputMode: 'decimal',
                  style: { MozAppearance: 'textfield' },
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel id="edit-paid-by-label">Paid by</InputLabel>
              <Select
                labelId="edit-paid-by-label"
                label="Paid by"
                value={paidBy}
                onChange={(e) => onPaidByChange(e.target.value)}
              >
                {participants.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="edit-expense-dialog__mode-toggle">
            <button
              type="button"
              className={`edit-expense-dialog__mode-btn${splitMode === 'equally' ? ' edit-expense-dialog__mode-btn--active' : ''}`}
              onClick={() => onSplitModeChange('equally')}
            >
              Equally
            </button>
            <button
              type="button"
              className={`edit-expense-dialog__mode-btn${splitMode === 'by_amounts' ? ' edit-expense-dialog__mode-btn--active' : ''}`}
              onClick={() => onSplitModeChange('by_amounts')}
            >
              By amounts
            </button>
          </div>

          <div>
            <div className="edit-expense-dialog__section-label">Split between</div>
            <div className="edit-expense-dialog__splits">
              {participants.map((p) => (
                <div key={p.id} className="edit-expense-dialog__split-row">
                  <Checkbox
                    checked={splits[p.id]?.checked ?? false}
                    onChange={() => onToggleSplit(p.id)}
                  />
                  <span className="edit-expense-dialog__split-name">{p.displayName}</span>
                  <div className="edit-expense-dialog__split-amount">
                    <TextField
                      size="small"
                      value={splits[p.id]?.amount ?? '0.00'}
                      onChange={(e) => onSplitAmountChange(p.id, e.target.value)}
                      disabled={!splits[p.id]?.checked || splitMode === 'equally'}
                      slotProps={{
                        input: {
                          inputMode: 'decimal',
                          style: { MozAppearance: 'textfield' },
                        },
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {submitError && <Alert severity="error">{submitError}</Alert>}
        </div>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={onSubmit} disabled={isLoading}>
          Save changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
