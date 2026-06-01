import type { Group } from '@/domain/group/entities/Group';
import type { Participant } from '@/domain/group/entities/Participant';

export interface EditGroupDialogProps {
  open: boolean;
  group: Group | null;
  onClose: () => void;
  onSuccess: (updatedGroup: Group) => void;
}

export interface UseEditGroupDialogProps {
  group: Group | null;
  onSuccess: (updatedGroup: Group) => void;
  onClose: () => void;
}

export interface UseEditGroupDialogReturn {
  name: string;
  nameError: string | null;
  currency: string;
  participants: Participant[];
  newAliasName: string;
  newAliasError: string | null;
  isLoading: boolean;
  submitError: string | null;
  participantToRemove: Participant | null;
  currentUserId: string | null;
  canRemoveParticipant: (participantId: string) => boolean;
  onNameChange: (value: string) => void;
  onNewAliasNameChange: (value: string) => void;
  onRemoveParticipant: (participantId: string) => void;
  onRemoveParticipantSuccess: (updatedGroup: Group) => void;
  onCancelRemove: () => void;
  onAddAlias: () => void;
  onSubmit: () => void;
}
