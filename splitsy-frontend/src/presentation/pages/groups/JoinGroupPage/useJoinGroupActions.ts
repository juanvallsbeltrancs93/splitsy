import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../utils/hooks/useAuth';
import { ConflictError } from '@/domain/shared/errors';

export interface JoinGroupActions {
  isClaiming: boolean;
  claimError: string | null;
  handleClaim: (aliasId: string) => Promise<void>;
}

export function useJoinGroupActions(groupId: string): JoinGroupActions {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const { compositionRoot } = useAuth();
  const navigate = useNavigate();

  const handleClaim = useCallback(
    async (aliasId: string) => {
      setClaimError(null);
      setIsClaiming(true);
      try {
        await compositionRoot!.useCases.groups.claimParticipant.execute({
          groupId,
          participantId: aliasId,
        });
        navigate(`/groups/${groupId}`);
      } catch (err) {
        if (err instanceof ConflictError) {
          setClaimError(err.message);
        } else if (err instanceof Error) {
          setClaimError('Failed to claim spot. Please try again.');
        } else {
          setClaimError('Failed to claim spot. Please try again.');
        }
      } finally {
        setIsClaiming(false);
      }
    },
    [groupId, compositionRoot, navigate]
  );

  return { isClaiming, claimError, handleClaim };
}
