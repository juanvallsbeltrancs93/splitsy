import Button from '@mui/material/Button';
import { GroupList } from '../../../components/groups/GroupList';
import type { HomePageViewProps } from './types';
import './styles.css';

export function HomePageView({ groups, onGroupClick, onNewGroup }: HomePageViewProps) {
  return (
    <div>
      <div className="home-page__header">
        <Button variant="contained" size="small" onClick={onNewGroup}>
          New group
        </Button>
      </div>
      <GroupList groups={groups} onGroupClick={onGroupClick} />
    </div>
  );
}
