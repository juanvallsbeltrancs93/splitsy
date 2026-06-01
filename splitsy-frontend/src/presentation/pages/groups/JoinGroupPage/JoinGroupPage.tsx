import { useParams } from 'react-router-dom';
import { AppLayout } from '../../../components/layout/AppLayout';
import { JoinGroupView } from '../JoinGroupView';
import { useJoinGroupState } from './useJoinGroupState';
import { useJoinGroupActions } from './useJoinGroupActions';

export function JoinGroupPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { group, isLoading, error, availableAliases } = useJoinGroupState(groupId!);
  const { isClaiming, claimError, handleClaim } = useJoinGroupActions(groupId!);

  return (
    <AppLayout>
      <JoinGroupView
        group={group}
        availableAliases={availableAliases}
        isLoading={isLoading}
        error={error}
        isClaiming={isClaiming}
        claimError={claimError}
        onClaim={handleClaim}
      />
    </AppLayout>
  );
}
