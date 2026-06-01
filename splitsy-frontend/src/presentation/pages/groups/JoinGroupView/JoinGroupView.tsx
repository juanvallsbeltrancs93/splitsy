import './styles.css';
import type { JoinGroupViewProps } from './types';
import { ActionableItem } from '../../../components/shared/ActionableItem';

export function JoinGroupView({
  group,
  availableAliases,
  isLoading,
  error,
  isClaiming,
  claimError,
  onClaim,
}: JoinGroupViewProps) {
  if (isLoading) {
    return (
      <div className="join-group-view">
        <p className="join-group-view__message">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="join-group-view">
        <p className="join-group-view__message join-group-view__message--error">{error}</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="join-group-view">
        <p className="join-group-view__message">Group not found</p>
      </div>
    );
  }

  return (
    <div className="join-group-view">
      <h2 className="join-group-view__title">Join {group.name}</h2>
      <p className="join-group-view__subtitle">Pick your spot to join the group</p>

      {claimError && (
        <div className="join-group-view__claim-error">
          <p className="join-group-view__message join-group-view__message--error">{claimError}</p>
        </div>
      )}

      {availableAliases.length === 0 ? (
        <div className="join-group-view__empty">
          <p className="join-group-view__message">No available spots</p>
        </div>
      ) : (
        <ul className="join-group-view__alias-list">
          {availableAliases.map((alias) => (
            <li key={alias.id}>
              <ActionableItem
                name={alias.displayName}
                firstLetter={alias.displayName.charAt(0).toUpperCase()}
                actionLabel="Claim"
                actionDisabled={isClaiming}
                actionLoading={isClaiming}
                onAction={() => onClaim(alias.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
