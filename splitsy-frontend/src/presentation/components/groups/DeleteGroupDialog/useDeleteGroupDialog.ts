import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../utils/hooks/useAuth';
import type { UseDeleteGroupDialogProps } from './types';

export function useDeleteGroupDialog({ groupId, onClose }: UseDeleteGroupDialogProps) {
  const { compositionRoot } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = useCallback(async () => {
    try {
      await compositionRoot!.useCases.groups.delete.execute({ groupId });
      navigate('/');
    } catch (err) {
      console.error('[DeleteGroupDialog] Failed to delete group:', err);
    } finally {
      onClose();
    }
  }, [compositionRoot, groupId, navigate, onClose]);

  return {
    handleConfirm,
  };
}
