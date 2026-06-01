import { Navigate } from 'react-router-dom';
import { useRegisterPage } from './useRegisterPage';
import { RegisterForm } from '../RegisterForm/RegisterForm';
import './styles.css';

export function RegisterPage() {
  const { form, errors, isLoading, isAuthenticated, handleChange, handleSubmit } = useRegisterPage();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <RegisterForm
      name={form.name}
      email={form.email}
      password={form.password}
      confirmPassword={form.confirmPassword}
      errors={errors}
      isLoading={isLoading}
      onNameChange={handleChange('name')}
      onEmailChange={handleChange('email')}
      onPasswordChange={handleChange('password')}
      onConfirmPasswordChange={handleChange('confirmPassword')}
      onSubmit={handleSubmit}
    />
  );
}
