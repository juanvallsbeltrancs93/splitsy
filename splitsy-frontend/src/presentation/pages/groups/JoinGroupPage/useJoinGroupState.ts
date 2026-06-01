import { useMemo } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../utils/hooks/useAuth';
import type { Group } from '@/domain/group/entities/Group';
import type { Participant } from '@/domain/group/entities/Participant';

export interface JoinGroupState {
  group: Group | null;
  isLoading: boolean;
  error: string | null;
  availableAliases: Participant[];
  isAlreadyParticipant: boolean;
}

export function useJoinGroupState(groupId: string): JoinGroupState {
  const loaderData = useLoaderData() as { group: Group } | undefined;
  const group = loaderData?.group ?? null;

  const { user, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  const availableAliases = useMemo(() => {
    if (!group) return [];
    return group.participants.filter((p) => p.type === 'NON_REGISTERED' && p.isActive !== false);
  }, [group]);

  const isAlreadyParticipant = useMemo(() => {
    if (!group || !user) return false;
    const userId = user.id.value;
    return group.participants.some((p) => p.userId === userId && p.isActive !== false);
  }, [group, user]);

  const isLoading = isInitializing;
  const error = null;

  if (!isLoading) {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/join/${groupId}`);
    } else if (isAlreadyParticipant) {
      navigate(`/groups/${groupId}`);
    }
  }

  return {
    group,
    isLoading,
    error,
    availableAliases,
    isAlreadyParticipant,
  };
}
