import { useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { CURRENCIES } from '../../../data/currencies';
import type { ExpenseDetailDialogProps, UseExpenseDetailDialogReturn } from './types';

export function useExpenseDetailDialog(
  props: ExpenseDetailDialogProps,
): UseExpenseDetailDialogReturn {
  const { open, expense, participants, currencyCode, hasPrev, hasNext, onPrev, onNext, onClose } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const symbol = CURRENCIES.find(c => c.code === currencyCode)?.symbol ?? currencyCode;

  // KEEP: window-level keyboard navigation requires DOM event listener.
  // No React synthetic event covers window-level arrow keys across focus boundaries.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, hasPrev, hasNext, onPrev, onNext, onClose]);

  const payer = expense
    ? participants.find((p) => p.id === expense.paidBy.value)
    : undefined;
  const payerName = payer?.displayName ?? 'Unknown';
  const payerLetter = payerName[0].toUpperCase();

  const formattedDate =
    expense?.date
      ? new Date(expense.date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : null;

  const payerOwed = expense
    ? (() => {
        const payerSplit = expense.splits.find(
          split => String(split.participantId) === String(expense.paidBy.value),
        );
        const payerOwnSplit = payerSplit?.amount ?? 0;
        return (expense.amount - payerOwnSplit);
      })()
    : '0.00';

  return {
    fullScreen,
    symbol,
    payer,
    payerName,
    payerLetter,
    formattedDate,
    payerOwed,
  };
}
