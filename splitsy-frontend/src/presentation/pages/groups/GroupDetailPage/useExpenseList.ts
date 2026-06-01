import { useState, useCallback, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { Expense } from '@/domain/expense/entities/Expense';
import type { GroupDetailLoaderData } from './types';

export function useExpenseList(refreshBalances: () => Promise<void>) {
  const { expenses: initialExpenses } = useLoaderData() as GroupDetailLoaderData;

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [selectedExpenseIndex, setSelectedExpenseIndex] = useState<number | null>(null);

  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]
  );

  const selectedExpense = selectedExpenseIndex !== null ? sortedExpenses[selectedExpenseIndex] : null;
  const hasPrev = selectedExpenseIndex !== null && selectedExpenseIndex > 0;
  const hasNext = selectedExpenseIndex !== null && selectedExpenseIndex < sortedExpenses.length - 1;

  const onExpenseCreated = useCallback((expense: Expense) => {
    setExpenses((prev) => [...prev, expense]);
    refreshBalances();
  }, [refreshBalances]);

  const onExpenseClick = useCallback((expense: Expense) => {
    const idx = sortedExpenses.findIndex(e => e.id.value === expense.id.value);
    setSelectedExpenseIndex(idx >= 0 ? idx : null);
  }, [sortedExpenses]);

  const onExpenseDetailClose = useCallback(() => {
    setSelectedExpenseIndex(null);
  }, []);

  const onPrev = useCallback(() => {
    setSelectedExpenseIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
  }, []);

  const onNext = useCallback(() => {
    setSelectedExpenseIndex(prev =>
      prev !== null && prev < sortedExpenses.length - 1 ? prev + 1 : prev
    );
  }, [sortedExpenses.length]);

  const applyExpenseEdit = useCallback((updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id.value === updatedExpense.id.value ? updatedExpense : e));
    setSelectedExpenseIndex(prev => {
      if (prev === null) return null;
      return prev;
    });
    refreshBalances();
  }, [refreshBalances]);

  const applyExpenseDelete = useCallback((expenseToDelete: Expense) => {
    setExpenses(prev => prev.filter(e => e.id.value !== expenseToDelete.id.value));
    setSelectedExpenseIndex(null);
    refreshBalances();
  }, [refreshBalances]);

  return {
    expenses,
    sortedExpenses,
    selectedExpense,
    selectedExpenseIndex,
    hasPrev,
    hasNext,
    onExpenseCreated,
    onExpenseClick,
    onExpenseDetailClose,
    onPrev,
    onNext,
    applyExpenseEdit,
    applyExpenseDelete,
  };
}
