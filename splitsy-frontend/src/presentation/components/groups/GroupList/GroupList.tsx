import { GroupCard } from '../GroupCard';
import './styles.css';
import type { GroupListProps } from './types';

export function GroupList({ groups, onGroupClick }: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="group-list__empty">
        <span className="group-list__empty-icon">👥</span>
        <span className="group-list__empty-title">No groups yet</span>
        <span className="group-list__empty-subtitle">
          Create your first group to start splitting expenses
        </span>
      </div>
    );
  }

  return (
    <div className="group-list">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          id={group.id}
          name={group.name}
          participantCount={group.participants.length}
          onClick={onGroupClick}
        />
      ))}
    </div>
  );
}
