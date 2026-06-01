export interface UseLoginPageReturn {
  username: string;
  password: string;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  justRegistered: boolean;
  redirect: string | null;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  handleSubmit: () => Promise<void>;
}
