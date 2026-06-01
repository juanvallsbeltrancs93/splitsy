import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CURRENCIES } from '../../../data/currencies';
import type { CreateGroupFormProps } from './types';
import { useCreateGroupForm } from './useCreateGroupForm';
import './styles.css';

export function CreateGroupForm({
  currentUserName,
  name,
  nameError,
  currency,
  aliases,
  newAlias,
  submitError,
  isLoading,
  onNameChange,
  onCurrencyChange,
  onNewAliasChange,
  onAddAlias,
  onRemoveAlias,
  onSubmit,
}: CreateGroupFormProps) {
  const { handleKeyDown, handleFormSubmit, handleBack } = useCreateGroupForm({ onAddAlias, onSubmit });

  return (
    <div>
      <button className="create-group-form__back" onClick={handleBack}>
        <ArrowBackIcon />
      </button>

      <form className="create-group-form" onSubmit={handleFormSubmit}>
        <TextField
          label="Group name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          error={!!nameError}
          helperText={nameError}
          fullWidth
          autoFocus
        />

        <FormControl fullWidth>
          <InputLabel id="currency-label">Currency</InputLabel>
          <Select
            labelId="currency-label"
            value={currency}
            label="Currency"
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.flag} {c.code} — {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div>
          <div className="create-group-form__alias-row">
            <TextField
              className="create-group-form__alias-input"
              label="Add Participant"
              value={newAlias}
              onChange={(e) => onNewAliasChange(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
            />
            <Button
              variant="outlined"
              onClick={onAddAlias}
              className="create-group-form__add-btn"
            >
              Add
            </Button>
          </div>

          <div className="create-group-form__aliases">
            <div className="create-group-form__alias-item create-group-form__alias-item--self">
              <span className="create-group-form__alias-name">{currentUserName}</span>
              <span className="create-group-form__alias-badge">You</span>
            </div>
            {aliases.map((alias, index) => (
              <div key={index} className="create-group-form__alias-item">
                <span className="create-group-form__alias-name">{alias}</span>
                <button
                  type="button"
                  className="create-group-form__alias-remove"
                  onClick={() => onRemoveAlias(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Create group'}
        </Button>
      </form>
    </div>
  );
}
