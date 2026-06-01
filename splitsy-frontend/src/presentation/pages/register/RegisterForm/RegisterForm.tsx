import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { AuthLayout } from '../../../components/auth/AuthLayout';
import type { RegisterFormProps } from './types';
import './styles.css';

export function RegisterForm({
  name,
  email,
  password,
  confirmPassword,
  errors,
  isLoading,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: RegisterFormProps) {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <AuthLayout subtitle="Create your account">
      <form onSubmit={handleFormSubmit} className="auth-layout__form">
        {errors.general && (
          <Alert severity="error">{errors.general}</Alert>
        )}

        <TextField
          label="Name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
        />

        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          error={!!errors.password}
          helperText={errors.password ?? 'Min 8 chars, uppercase, lowercase, number and special character'}
        />

        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress /> : 'Create account'}
        </Button>

        <div className="auth-layout__footer">
          <Link component={RouterLink} to="/login">
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
