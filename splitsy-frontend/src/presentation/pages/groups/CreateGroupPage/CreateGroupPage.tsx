import './styles.css';
import { useCreateGroupPage } from './useCreateGroupPage';
import { AppLayout } from '../../../components/layout/AppLayout';
import { CreateGroupForm } from '../CreateGroupForm';

export function CreateGroupPage() {
  const hook = useCreateGroupPage();

  return (
    <AppLayout>
      <CreateGroupForm {...hook} />
    </AppLayout>
  );
}
