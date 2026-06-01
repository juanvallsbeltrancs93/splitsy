import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../utils/hooks/useAuth';
import type { Participant } from '@/domain/group/entities/Participant';
import type { Group } from '@/domain/group/entities/Group';
import type { UseEditGroupDialogProps, UseEditGroupDialogReturn } from './types';

export function useEditGroupDialog({ group, onSuccess, onClose }: UseEditGroupDialogProps): UseEditGroupDialogReturn {
  const { compositionRoot, user } = useAuth();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [newAliasName, setNewAliasName] = useState('');
  const [newAliasError, setNewAliasError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null);

  // Reset form when group changes (dialog opens)
  useEffect(() => {
    if (group) {
      setName(group.name);
      setNameError(null);
      setSubmitError(null);
      setNewAliasName('');
      setParticipantToRemove(null);
    }
  }, [group]);

  const onNameChange = useCallback((value: string) => {
    setName(value);
    setNameError(null);
  }, []);

  const onNewAliasNameChange = useCallback((value: string) => {
    setNewAliasName(value);
    setNewAliasError(null);
  }, []);

  const onRemoveParticipant = useCallback((participantId: string) => {
    const p = group?.activeParticipants.find((p) => p.id === participantId);
    if (p) {
      setParticipantToRemove(p);
    }
  }, [group]);

  const onRemoveParticipantSuccess = useCallback((updatedGroup: Group) => {
    onSuccess(updatedGroup);
    setParticipantToRemove(null);
  }, [onSuccess]);

  const onCancelRemove = useCallback(() => {
    setParticipantToRemove(null);
  }, []);

  const onAddAlias = useCallback(async () => {
    if (!group || !compositionRoot || !newAliasName.trim()) return;

    const normalized = newAliasName.trim().toLowerCase();
    const isDuplicate = group.activeParticipants.some(
      (p) => p.displayName.trim().toLowerCase() === normalized
    );
    if (isDuplicate) {
      setNewAliasError(`A participant named "${newAliasName.trim()}" already exists`);
      return;
    }

    setIsLoading(true);
    try {
      const updatedGroup = await compositionRoot.useCases.groups.addParticipant.execute({
        groupId: group.id,
        body: { type: 'NON_REGISTERED', display_name: newAliasName.trim() },
      });
      setNewAliasName('');
      onSuccess(updatedGroup);
    } catch (err) {
      console.error('[EditGroupDialog] Failed to add alias:', err);
    } finally {
      setIsLoading(false);
    }
  }, [group, compositionRoot, newAliasName, onSuccess]);

  const onSubmit = useCallback(async () => {
    if (!group || !compositionRoot) return;

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    try {
      await compositionRoot.useCases.groups.update.execute({
        groupId: group.id,
        body: { name: name.trim() },
      });
      const updatedGroup = await compositionRoot.useCases.groups.get.execute({ groupId: group.id });
      onSuccess(updatedGroup);
      onClose();
    } catch (err) {
      console.error('[EditGroupDialog] Failed to update group:', err);
      setSubmitError('Failed to update group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [group, compositionRoot, name, onSuccess, onClose]);

  const canRemoveParticipant = useCallback((participantId: string): boolean => {
    if (!group) return false;
    const currentParticipant = group.participants.find((p) => p.userId === (user?.id.value ?? null));
    const isOwner = !!currentParticipant && group.ownerId === currentParticipant.id;
    if (isOwner) {
      return participantId !== currentParticipant.id;
    }
    return participantId === currentParticipant?.id;
  }, [group, user]);

  return {
    name,
    nameError,
    currency: group?.currency ?? '',
    participants: group?.activeParticipants ?? [],
    newAliasName,
    newAliasError,
    isLoading,
    submitError,
    participantToRemove,
    currentUserId: user?.id.value ?? null,
    canRemoveParticipant,
    onNameChange,
    onNewAliasNameChange,
    onRemoveParticipant,
    onRemoveParticipantSuccess,
    onCancelRemove,
    onAddAlias,
    onSubmit,
  };
}
