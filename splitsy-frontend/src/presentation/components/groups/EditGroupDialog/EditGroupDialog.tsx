import './styles.css';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEditGroupDialog } from './useEditGroupDialog';
import { RemoveParticipantDialog } from '../RemoveParticipantDialog';
import type { EditGroupDialogProps } from './types';

export function EditGroupDialog(props: EditGroupDialogProps) {
  const { open, group, onClose, onSuccess } = props;
  const {
    name,
    nameError,
    currency,
    participants,
    newAliasName,
    newAliasError,
    isLoading,
    submitError,
    participantToRemove,
    currentUserId,
    canRemoveParticipant,
    onNameChange,
    onNewAliasNameChange,
    onRemoveParticipant,
    onRemoveParticipantSuccess,
    onCancelRemove,
    onAddAlias,
    onSubmit,
  } = useEditGroupDialog({ group, onSuccess, onClose });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit group</DialogTitle>
      <DialogContent className="edit-group-dialog__content">
        <TextField
          label="Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          error={!!nameError}
          helperText={nameError}
          fullWidth
          margin="normal"
        />

        <div className="edit-group-dialog__currency">
          <span className="edit-group-dialog__label">Currency</span>
          <span className="edit-group-dialog__value">{currency}</span>
        </div>

        <div className="edit-group-dialog__participants">
          <span className="edit-group-dialog__label">Participants</span>
          <div className="edit-group-dialog__participant-list">
            {participants.map((p) => {
              const canRemove = canRemoveParticipant(p.id);
              return (
                <div key={p.id} className="edit-group-dialog__participant-row">
                  <span className="edit-group-dialog__participant-name">{p.displayName}</span>
                  <IconButton
                    onClick={() => onRemoveParticipant(p.id)}
                    aria-label={`Remove ${p.displayName}`}
                    disabled={isLoading || !canRemove}
                    size="small"
                    className={canRemove ? 'edit-group-dialog__remove-btn--danger' : undefined}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              );
            })}
          </div>

          <div className="edit-group-dialog__add-alias">
            <TextField
              label="Add alias participant"
              value={newAliasName}
              onChange={(e) => onNewAliasNameChange(e.target.value)}
              error={!!newAliasError}
              helperText={newAliasError}
              size="small"
              className="edit-group-dialog__alias-input"
            />
            <Button
              onClick={onAddAlias}
              variant="outlined"
              disabled={isLoading || !newAliasName.trim()}
              size="small"
            >
              Add
            </Button>
          </div>
        </div>

        {submitError && (
          <Alert severity="error" className="edit-group-dialog__error">
            {submitError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
          Save changes
        </Button>
      </DialogActions>

      <RemoveParticipantDialog
        open={participantToRemove !== null}
        participant={participantToRemove}
        groupId={group?.id ?? ''}
        currentUserId={currentUserId}
        onSuccess={onRemoveParticipantSuccess}
        onClose={onCancelRemove}
      />
    </Dialog>
  );
}
