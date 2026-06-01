import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../utils/hooks/useAuth';
import { CURRENCIES } from '../../../data/currencies';
import type {
  RecordSettlementDialogProps,
  UseRecordSettlementDialogReturn,
} from './types';

export function useRecordSettlementDialog({
  planItem,
  participants,
  currencyCode,
  groupId,
  onClose,
  onSettlementCreated,
}: RecordSettlementDialogProps): UseRecordSettlementDialogReturn {
  const { compositionRoot } = useAuth();

  const currencySymbol =
    CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? currencyCode;

  const fromName = useMemo(
    () =>
      participants.find((p) => p.id === planItem.fromParticipantId)?.displayName ??
      'Unknown',
    [participants, planItem.fromParticipantId]
  );

  const toName = useMemo(
    () =>
      participants.find((p) => p.id === planItem.toParticipantId)?.displayName ??
      'Unknown',
    [participants, planItem.toParticipantId]
  );

  const [note, setNote] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onNoteChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value);
  }, []);

  const onDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  }, []);

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      await compositionRoot!.useCases.settlements.create.execute({
        groupId,
        body: {
          fromParticipantId: planItem.fromParticipantId,
          toParticipantId: planItem.toParticipantId,
          amount: planItem.amount,
          date,
          note: note.trim() || undefined,
        },
      });

      onClose();
      onSettlementCreated();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to record settlement'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    compositionRoot,
    groupId,
    planItem,
    date,
    note,
    onClose,
    onSettlementCreated,
  ]);

  return {
    isLoading,
    note,
    date,
    submitError,
    fromName,
    toName,
    amount: planItem.amount,
    currencySymbol,
    onNoteChange,
    onDateChange,
    onSubmit,
  };
}
