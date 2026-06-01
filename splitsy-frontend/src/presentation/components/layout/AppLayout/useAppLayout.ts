import { useAuth } from '../../../utils/hooks/useAuth';
import type { UseAppLayoutReturn } from './types';

export function useAppLayout(): UseAppLayoutReturn {
  const { user, logout } = useAuth();
  return { userName: user?.name, logout };
}
