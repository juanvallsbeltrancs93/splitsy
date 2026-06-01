import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../utils/hooks/useAuth';
import { Name } from '../../../../domain/shared/value-objects/Name';
import { Email } from '../../../../domain/shared/value-objects/Email';
import { Password } from '../../../../domain/shared/value-objects/Password';
import type { RegisterFormFields, RegisterFormErrors, UseRegisterPageReturn } from './types';

function validateForm(form: RegisterFormFields): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  try { Name.create(form.name); } catch (e) { errors.name = (e as Error).message; }
  try { Email.create(form.email); } catch (e) { errors.email = (e as Error).message; }
  try { Password.create(form.password); } catch (e) { errors.password = (e as Error).message; }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

function hasErrors(errors: RegisterFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

function parseBackendError(message: string): { emailConflict: boolean; message: string } {
  const match = message.match(/Error registering user: (.+)/s);
  const inner = match ? match[1] : message;

  try {
    const parsed = JSON.parse(inner);
    const detail = parsed?.detail;

    if (typeof detail === 'string') {
      const emailConflict = detail.toLowerCase().includes('already exists');
      return { emailConflict, message: detail };
    }

    if (Array.isArray(detail)) {
      const msg = detail.map((d: { msg?: string }) => d.msg ?? String(d)).join('. ');
      return { emailConflict: false, message: msg };
    }
  } catch {
    // not JSON — use inner string directly
  }

  const emailConflict = inner.toLowerCase().includes('already exists');
  return { emailConflict, message: inner };
}

export function useRegisterPage(): UseRegisterPageReturn {
  const { publicCompositionRoot, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [form, setForm] = useState<RegisterFormFields>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = useCallback(
    (field: keyof RegisterFormFields) => (value: string) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (hasSubmitted) {
          setErrors(validateForm(next));
        }
        return next;
      });
    },
    [hasSubmitted],
  );

  const handleSubmit = useCallback(async () => {
    setHasSubmitted(true);
    const validationErrors = validateForm(form);

    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await publicCompositionRoot.useCases.auth.register.execute({
        body: { name: form.name.trim(), email: form.email, password: form.password },
      });
      const redirectParam = redirect ? `&redirect=${encodeURIComponent(redirect)}` : '';
      navigate(`/login?registered=true${redirectParam}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const { emailConflict, message: parsed } = parseBackendError(message);

      if (emailConflict) {
        setErrors({ email: 'This email is already registered' });
      } else {
        setErrors({ general: parsed || 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [form, publicCompositionRoot, navigate]);

  const isValid =
    !!form.name && !!form.email && !!form.password && !!form.confirmPassword && !hasErrors(errors);

  return { form, errors, isLoading, isValid, isAuthenticated, handleChange, handleSubmit };
}
