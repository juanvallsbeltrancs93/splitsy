import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import type { LoginFormProps } from './types';
import './styles.css';

export function LoginForm({
  username,
  password,
  error,
  isLoading,
  justRegistered,
  redirectToRegister,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <AuthLayout subtitle="Welcome back">
      <form onSubmit={handleFormSubmit} className={"auth-layout__form"}>
        {justRegistered && (
          <Alert severity="success">Account created! Please sign in.</Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress /> : 'Sign in'}
        </Button>

        <div className={"auth-layout__footer"}>
          <Link component={RouterLink} to={redirectToRegister || '/register'}>
            Don't have an account? Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
