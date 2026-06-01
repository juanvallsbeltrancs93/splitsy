import { useState, useCallback } from 'react';
import type { Expense } from '@/domain/expense/entities/Expense';

export function useGroupDetailDialogs() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDuplicate, setExpenseToDuplicate] = useState<Expense | null>(null);

  const handleOpenAddExpense = useCallback(() => {
    setIsAddExpenseOpen(true);
  }, []);

  const handleCloseAddExpense = useCallback(() => {
    setIsAddExpenseOpen(false);
    setExpenseToDuplicate(null);
  }, []);

  const handleEditGroup = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);

  const handleDeleteGroup = useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const handleEditExpense = useCallback((expense: Expense) => {
    setExpenseToEdit(expense);
  }, []);

  const handleDuplicateExpense = useCallback((expense: Expense) => {
    setExpenseToDuplicate(expense);
    setIsAddExpenseOpen(true);
  }, []);

  const handleCancelEditExpense = useCallback(() => {
    setExpenseToEdit(null);
  }, []);

  const handleDeleteExpense = useCallback((expense: Expense) => {
    setExpenseToDelete(expense);
  }, []);

  const handleCancelDeleteExpense = useCallback(() => {
    setExpenseToDelete(null);
  }, []);

  return {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddExpenseOpen,
    expenseToDelete,
    expenseToEdit,
    expenseToDuplicate,
    handleOpenAddExpense,
    handleCloseAddExpense,
    handleEditGroup,
    handleCloseEditDialog,
    handleDeleteGroup,
    handleCancelDelete,
    handleEditExpense,
    handleDuplicateExpense,
    handleCancelEditExpense,
    handleDeleteExpense,
    handleCancelDeleteExpense,
  };
}
