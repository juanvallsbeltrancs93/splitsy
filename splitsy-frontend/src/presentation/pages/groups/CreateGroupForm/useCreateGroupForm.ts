import { useNavigate } from 'react-router-dom';
import type { CreateGroupFormProps } from './types';

export function useCreateGroupForm({ onAddAlias, onSubmit }: Pick<CreateGroupFormProps, 'onAddAlias' | 'onSubmit'>) {
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddAlias();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleBack = () => navigate('/');

  return { handleKeyDown, handleFormSubmit, handleBack };
}
