import type { AuthLayoutProps } from './types';
import './styles.css';

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__card">
        <div className="auth-layout__logo">Splitsy</div>
        <div className="auth-layout__subtitle">{subtitle}</div>
        {children}
      </div>
    </div>
  );
}
