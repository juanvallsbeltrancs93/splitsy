export interface LoginFormProps {
  username: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  justRegistered?: boolean;
  redirectToRegister?: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}
