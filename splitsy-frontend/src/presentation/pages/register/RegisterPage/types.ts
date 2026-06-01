export interface RegisterFormFields {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface UseRegisterPageReturn {
  form: RegisterFormFields;
  errors: RegisterFormErrors;
  isLoading: boolean;
  isValid: boolean;
  isAuthenticated: boolean;
  handleChange: (field: keyof RegisterFormFields) => (value: string) => void;
  handleSubmit: () => Promise<void>;
}
