import type { Group } from '../../../../domain/group/entities/Group';

export interface GroupListProps {
  groups: Group[];
  onGroupClick: (id: string) => void;
}
