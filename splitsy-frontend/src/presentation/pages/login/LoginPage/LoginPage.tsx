import { Navigate } from 'react-router-dom';
import { useLoginPage } from './useLoginPage';
import { LoginForm } from '../LoginForm/LoginForm';
import './styles.css';

export function LoginPage() {
  const { username, password, error, isLoading, isAuthenticated, justRegistered, redirect, setUsername, setPassword, handleSubmit } = useLoginPage();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const registerLink = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register';

  return (
    <LoginForm
      username={username}
      password={password}
      error={error}
      isLoading={isLoading}
      justRegistered={justRegistered}
      redirectToRegister={registerLink}
      onUsernameChange={setUsername}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}
