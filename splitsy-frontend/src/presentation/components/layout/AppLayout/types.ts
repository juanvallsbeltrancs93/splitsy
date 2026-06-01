import type { ReactNode } from 'react';

export interface AppLayoutProps {
  children: ReactNode;
}

export interface UseAppLayoutReturn {
  userName: string | undefined;
  logout: () => void;
}
