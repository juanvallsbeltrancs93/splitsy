import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/presentation/utils/hooks/useAuth';
import type { RemoveParticipantDialogProps, UseRemoveParticipantDialogReturn } from './types';

export function useRemoveParticipantDialog({
  participant,
  groupId,
  currentUserId,
  onSuccess,
  onClose,
}: RemoveParticipantDialogProps): UseRemoveParticipantDialogReturn {
  const { compositionRoot } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSelf = useMemo(() => {
    return participant?.userId != null && participant.userId === currentUserId;
  }, [participant, currentUserId]);

  const onConfirm = useCallback(async () => {
    if (!participant || !compositionRoot) return;
    setIsLoading(true);
    setSubmitError(null);
    try {
      const updatedGroup = await compositionRoot.useCases.groups.removeParticipant.execute({
        groupId,
        participantId: participant.id,
      });
      onSuccess(updatedGroup);
      if (isSelf) {
        navigate('/');
      } else {
        onClose();
      }
    } catch (err) {
      console.error('[RemoveParticipantDialog] Failed to remove participant:', err);
      setSubmitError('Failed to remove participant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [participant, groupId, compositionRoot, isSelf, onSuccess, onClose, navigate]);

  return {
    isLoading,
    isSelf,
    submitError,
    onConfirm,
  };
}
