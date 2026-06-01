import type { Group } from '../../../../domain/group/entities/Group';

export interface HomePageViewProps {
  groups: Group[];
  onGroupClick: (id: string) => void;
  onNewGroup: () => void;
}
