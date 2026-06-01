import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './styles.css';
import type { GroupCardProps } from './types';

export function GroupCard({ id, name, participantCount, onClick }: GroupCardProps) {
  return (
    <button className="group-card" onClick={() => onClick(id)}>
      <div className="group-card__content">
        <span className="group-card__name">{name}</span>
        <span className="group-card__meta">
          {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
        </span>
      </div>
      <ChevronRightIcon className="group-card__chevron" />
    </button>
  );
}
