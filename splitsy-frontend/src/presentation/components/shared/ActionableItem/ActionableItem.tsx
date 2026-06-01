import './styles.css';
import { ParticipantItem } from '../ParticipantItem';
import type { ActionableItemProps } from './types';

export function ActionableItem({
  name,
  firstLetter,
  actionLabel,
  actionDisabled,
  actionLoading,
  onAction,
}: ActionableItemProps) {
  return (
    <div className="actionable-item">
      <ParticipantItem
        name={name}
        firstLetter={firstLetter}
        variant="default"
      />
      <button
        className="actionable-item__action-btn"
        onClick={onAction}
        disabled={actionDisabled}
        aria-label={`${actionLabel} ${name}`}
      >
        {actionLoading ? 'Loading...' : actionLabel}
      </button>
    </div>
  );
}
