import type { Group } from '@/domain/group/entities/Group';
import type { Participant } from '@/domain/group/entities/Participant';

export interface JoinGroupViewProps {
  group: Group | null;
  availableAliases: Participant[];
  isLoading: boolean;
  error: string | null;
  isClaiming: boolean;
  claimError: string | null;
  onClaim: (aliasId: string) => void;
}
