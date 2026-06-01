import { useNavigate } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import type { GroupsLoaderData } from './types';

export function useHomePage() {
  const { groups } = useLoaderData() as GroupsLoaderData;
  const navigate = useNavigate();

  const handleGroupClick = (id: string) => {
    navigate(`/groups/${id}`);
  };

  const handleNewGroup = () => {
    navigate('/groups/new');
  };

  return { groups, handleGroupClick, handleNewGroup };
}
