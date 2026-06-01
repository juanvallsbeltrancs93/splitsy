import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../utils/hooks/useAuth';
import { Name } from '@/domain/shared/value-objects/Name';

export function useCreateGroupPage() {
  const { compositionRoot, user } = useAuth();

  const currentUserName = user?.name ?? 'You';
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('EUR');
  const [aliases, setAliases] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onNameChange = useCallback((value: string) => {
    setName(value);
    setNameError(null);
  }, []);

  const onCurrencyChange = useCallback((value: string) => {
    setCurrency(value);
  }, []);

  const onNewAliasChange = useCallback((value: string) => {
    setNewAlias(value);
  }, []);

  const onAddAlias = useCallback(() => {
    const trimmed = newAlias.trim();
    if (!trimmed) return;
    if (aliases.includes(trimmed)) return;
    setAliases((prev) => [...prev, trimmed]);
    setNewAlias('');
  }, [newAlias, aliases]);

  const onRemoveAlias = useCallback((index: number) => {
    setAliases((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onSubmit = useCallback(async () => {
    try {
      Name.create(name);
    } catch (e) {
      setNameError((e as Error).message);
      return;
    }

    setNameError(null);
    setSubmitError(null);
    setIsLoading(true);

    try {
      await compositionRoot!.useCases.groups.create.execute({
        body: { name: name.trim(), aliases: aliases.length > 0 ? aliases : undefined, currency },
      });
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSubmitError(message || 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [name, aliases, currency, compositionRoot, navigate]);

  return {
    currentUserName,
    name,
    nameError,
    currency,
    aliases,
    newAlias,
    submitError,
    isLoading,
    onNameChange,
    onCurrencyChange,
    onNewAliasChange,
    onAddAlias,
    onRemoveAlias,
    onSubmit,
  };
}
