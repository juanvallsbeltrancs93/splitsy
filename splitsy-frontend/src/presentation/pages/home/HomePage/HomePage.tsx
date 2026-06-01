import './styles.css';
import { useHomePage } from './useHomePage';
import { AppLayout } from '../../../components/layout/AppLayout';
import { HomePageView } from '../HomePageView';

export function HomePage() {
  const { groups, handleGroupClick, handleNewGroup } = useHomePage();

  return (
    <AppLayout>
      <HomePageView groups={groups} onGroupClick={handleGroupClick} onNewGroup={handleNewGroup} />
    </AppLayout>
  );
}
