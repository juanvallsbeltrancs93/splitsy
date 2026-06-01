import type { AppLayoutProps } from './types';
import { useAppLayout } from './useAppLayout';
import './styles.css';

export function AppLayout({ children }: AppLayoutProps) {
  const { userName, logout } = useAppLayout();

  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <span className="app-layout__header-logo">Splitsy</span>
        <div className="app-layout__header-actions">
          <span className="app-layout__header-user">{userName}</span>
          <button className="app-layout__header-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="app-layout__main">{children}</main>
    </div>
  );
}
