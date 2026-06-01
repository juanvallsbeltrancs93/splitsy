import { useState, useCallback, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../../utils/hooks/useAuth';
import { CURRENCIES } from '../../../data/currencies';
import type { Expense } from '../../../../domain/expense/entities/Expense';
import type { Participant } from '../../../../domain/group/entities/Participant';
import type { SplitState, SplitMode, UseEditExpenseDialogReturn } from './types';

function recalculateSplits(
  newAmount: string,
  currentSplits: Record<string, SplitState>,
): Record<string, SplitState> {
  const total = parseFloat(newAmount);
  const checkedIds = Object.keys(currentSplits).filter((id) => currentSplits[id].checked);

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
    result[id] = { checked: s.checked, amount: s.checked ? perPerson : '0.00' };
  }
  return result;
}

function detectSplitMode(expense: Expense): SplitMode {
  if (expense.splits.length === 0) return 'equally';
  const first = expense.splits[0].amount;
  const allEqual = expense.splits.every((s) => Math.abs(s.amount - first) < 0.01);
  return allEqual ? 'equally' : 'by_amounts';
}

function buildSplitsFromExpense(
  expense: Expense,
  participants: Participant[],
): Record<string, SplitState> {
  const splits: Record<string, SplitState> = {};
  for (const p of participants) {
    const match = expense.splits.find((s) => String(s.participantId) === String(p.id));
    splits[p.id] = {
      checked: !!match,
      amount: match ? String(match.amount) : '0.00',
    };
  }
  return splits;
}

interface UseEditExpenseDialogProps {
  expense: Expense | null;
  participants: Participant[];
  currencyCode: string;
  onSuccess: (updatedExpense: Expense) => void;
  onClose: () => void;
}

export function useEditExpenseDialog({
  expense,
  participants,
  currencyCode,
  onSuccess,
  onClose,
}: UseEditExpenseDialogProps): UseEditExpenseDialogReturn {
  const { compositionRoot } = useAuth();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const currencySymbol = CURRENCIES.find((c) => c.code === currencyCode)?.symbol ?? currencyCode;

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);
  const [paidBy, setPaidBy] = useState('');
  const [splits, setSplits] = useState<Record<string, SplitState>>({});
  const [splitMode, setSplitMode] = useState<SplitMode>('equally');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset form when expense changes (dialog opens with a different expense)
  useEffect(() => {
    if (expense) {
      setTitle(expense.name);
      setAmount(String(expense.amount));
      setPaidBy(expense.paidBy.value);
      setSplits(buildSplitsFromExpense(expense, participants));
      setSplitMode(detectSplitMode(expense));
      setTitleError(null);
      setAmountError(null);
      setSubmitError(null);
      setIsLoading(false);
    }
  }, [expense, participants]);

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

  const onSplitAmountChange = useCallback((participantId: string, value: string) => {
    setSplits((prev) => ({
      ...prev,
      [participantId]: { ...prev[participantId], amount: value },
    }));
  }, []);

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
    if (!expense) return;

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

      const hasNegative = checkedSplits.some(([, s]) => parseFloat(s.amount || '0') < 0);
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
      const updatedExpense = await compositionRoot!.useCases.expenses.update.execute({
        expenseId: expense.id.value,
        body: {
          name: title.trim(),
          amount: parsedAmount,
          paidBy,
          splits: Object.entries(splits)
            .filter(([, s]) => s.checked)
            .map(([participantId, s]) => ({
              participantId,
              amount: parseFloat(s.amount),
            })),
        },
      });

      onSuccess(updatedExpense);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  }, [expense, title, amount, splits, splitMode, paidBy, compositionRoot, onSuccess, onClose]);

  return {
    isLoading,
    title,
    titleError,
    amount,
    amountError,
    paidBy,
    splits,
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
