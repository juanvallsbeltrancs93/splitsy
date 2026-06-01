import type { Group } from '@/domain/group/entities/Group';
import type { Participant } from '@/domain/group/entities/Participant';

export interface RemoveParticipantDialogProps {
  open: boolean;
  participant: Participant | null;
  groupId: string;
  currentUserId: string | null;
  onSuccess: (updatedGroup: Group) => void;
  onClose: () => void;
}

export interface UseRemoveParticipantDialogReturn {
  isLoading: boolean;
  isSelf: boolean;
  submitError: string | null;
  onConfirm: () => Promise<void>;
}
