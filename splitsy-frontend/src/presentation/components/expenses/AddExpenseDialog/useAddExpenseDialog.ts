import { useState, useCallback, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../../utils/hooks/useAuth';
import { CURRENCIES } from '../../../data/currencies';
import type { Group } from '../../../../domain/group/entities/Group';
import type { User } from '../../../../domain/users/entities/User';
import type { Expense } from '../../../../domain/expense/entities/Expense';
import type { AddExpenseDialogProps, UseAddExpenseDialogReturn, SplitState, SplitMode } from './types';

function recalculateSplits(
  newAmount: string,
  currentSplits: Record<string, SplitState>,
): Record<string, SplitState> {
  const total = parseFloat(newAmount);
  const checkedIds = Object.keys(currentSplits).filter(
    (id) => currentSplits[id].checked,
  );

  if (checkedIds.length === 0 || isNaN(total) || total <= 0) {
    const result: Record<string, SplitState> = {};
    for (const [id, s] of Object.entries(currentSplits)) {
      result[id] = { checked: s.checked, amount: '0.00' };
    }
    return result;
  }

  const perPerson = (total / checkedIds.length).toFixed(2);
  const result: Record<string, SplitState> = {};
  for (const [id, s] of Object.entries(currentSplits)) {
    result[id] = {
      checked: s.checked,
      amount: s.checked ? perPerson : '0.00',
    };
  }
  return result;
}

function buildInitialSplits(
  group: Group,
  amount: string,
): Record<string, SplitState> {
  const splits: Record<string, SplitState> = {};
  const total = parseFloat(amount);
  const activeParticipants = group.activeParticipants;
  const count = activeParticipants.length;
  const perPerson =
    count > 0 && !isNaN(total) && total > 0
      ? (total / count).toFixed(2)
      : '0.00';

  for (const p of activeParticipants) {
    splits[p.id] = { checked: true, amount: perPerson };
  }
  return splits;
}

function getDefaultPaidBy(group: Group, currentUser: User | null): string {
  const activeParticipants = group.activeParticipants;
  if (currentUser) {
    const match = activeParticipants.find(
      (p) => p.userId === currentUser.id.value,
    );
    if (match) return match.id;
  }
  return activeParticipants[0]?.id ?? '';
}

function buildSplitsFromExpense(
  expense: Expense,
  group: Group,
): Record<string, SplitState> {
  const splits: Record<string, SplitState> = {};
  for (const p of group.activeParticipants) {
    const split = expense.splits.find(
      (s) => String(s.participantId) === String(p.id),
    );
    splits[p.id] = {
      checked: split !== undefined,
      amount: split !== undefined ? String(split.amount) : '0.00',
    };
  }
  return splits;
}

function detectSplitMode(expense: Expense): SplitMode {
  const checkedSplits = expense.splits;
  if (checkedSplits.length === 0) return 'equally';
  const firstAmount = checkedSplits[0].amount;
  const allEqual = checkedSplits.every((s) => s.amount === firstAmount);
  return allEqual ? 'equally' : 'by_amounts';
}

export function useAddExpenseDialog({
  open,
  onClose,
  onExpenseCreated,
  initialExpense,
  group,
}: AddExpenseDialogProps): UseAddExpenseDialogReturn {
  const { user, compositionRoot } = useAuth();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const currencySymbol =
    CURRENCIES.find((c) => c.code === group.currency)?.symbol ?? group.currency;

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [paidBy, setPaidBy] = useState(() => getDefaultPaidBy(group, user));
  const [splits, setSplits] = useState<Record<string, SplitState>>(() =>
    buildInitialSplits(group, ''),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<SplitMode>('equally');

  // Reset form when dialog opens or initialExpense changes
  useEffect(() => {
    if (open) {
      if (initialExpense) {
        setTitle(initialExpense.name);
        setAmount(String(initialExpense.amount));
        setPaidBy(initialExpense.paidBy.value);
        setSplits(buildSplitsFromExpense(initialExpense, group));
        setSplitMode(detectSplitMode(initialExpense));
      } else {
        setTitle('');
        setAmount('');
        setPaidBy(getDefaultPaidBy(group, user));
        setSplits(buildInitialSplits(group, ''));
        setSplitMode('equally');
      }
      setTitleError(null);
      setAmountError(null);
      setIsLoading(false);
      setSubmitError(null);
    }
  }, [open, initialExpense, group, user]);

  const onTitleChange = useCallback((value: string) => {
    setTitle(value);
    setTitleError(null);
  }, []);

  const onAmountChange = useCallback((value: string) => {
    setAmount(value);
    setAmountError(null);
    setSplits((prev) => recalculateSplits(value, prev));
  }, []);

  const onPaidByChange = useCallback((value: string) => {
    setPaidBy(value);
  }, []);

  const onToggleSplit = useCallback(
    (participantId: string) => {
      setSplits((prev) => {
        const updated = {
          ...prev,
          [participantId]: {
            ...prev[participantId],
            checked: !prev[participantId].checked,
            amount: !prev[participantId].checked ? prev[participantId].amount : '0.00',
          },
        };
        if (splitMode === 'equally') {
          return recalculateSplits(amount, updated);
        }
        return updated;
      });
    },
    [amount, splitMode],
  );

  const onSplitAmountChange = useCallback(
    (participantId: string, value: string) => {
      setSplits((prev) => ({
        ...prev,
        [participantId]: { ...prev[participantId], amount: value },
      }));
    },
    [],
  );

  const onSplitModeChange = useCallback(
    (mode: SplitMode) => {
      setSplitMode(mode);
      if (mode === 'equally') {
        setSplits((prev) => recalculateSplits(amount, prev));
      }
    },
    [amount],
  );

  const onSubmit = useCallback(async () => {
    let hasError = false;

    if (!title.trim()) {
      setTitleError('Title is required');
      hasError = true;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Enter a valid positive amount');
      hasError = true;
    }

    if (!hasError) {
      const checkedSplits = Object.entries(splits).filter(([, s]) => s.checked);

      const hasNegative = checkedSplits.some(
        ([, s]) => parseFloat(s.amount || '0') < 0,
      );
      if (hasNegative) {
        setSubmitError('Split amounts cannot be negative');
        return;
      }

      if (splitMode === 'by_amounts') {
        const splitSum = checkedSplits.reduce(
          (sum, [, s]) => sum + parseFloat(s.amount || '0'),
          0,
        );
        if (Math.abs(splitSum - parsedAmount) > 0.01) {
          setSubmitError(
            `Split amounts (${splitSum.toFixed(2)}) must equal total (${parsedAmount.toFixed(2)})`,
          );
          return;
        }
      }
    }

    if (hasError) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      const expense = await compositionRoot!.useCases.expenses.create.execute({
        groupId: group.id,
        body: {
          name: title.trim(),
          amount: parsedAmount,
          date: new Date().toISOString().split('T')[0],
          paidBy,
          splits: Object.entries(splits)
            .filter(([, s]) => s.checked)
            .map(([id, s]) => ({
              participantId: id,
              amount: parseFloat(s.amount),
            })),
        },
      });

      onClose();
      onExpenseCreated(expense);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Failed to create expense',
      );
    } finally {
      setIsLoading(false);
    }
  }, [title, amount, splits, splitMode, compositionRoot, group, paidBy, onClose, onExpenseCreated]);

  return {
    isLoading,
    title,
    titleError,
    amount,
    amountError,
    paidBy,
    splits,
    participants: group.activeParticipants,
    currencyCode: group.currency,
    currencySymbol,
    submitError,
    splitMode,
    fullScreen,
    onTitleChange,
    onAmountChange,
    onPaidByChange,
    onToggleSplit,
    onSplitAmountChange,
    onSplitModeChange,
    onSubmit,
  };
}
