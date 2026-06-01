import { mockExpenseRepository } from '@tests/fakeRepositories';
import { expenseMock } from '../entities/Expense.test';
import type {
  CreateExpenseParams,
  ListExpensesParams,
  GetExpenseParams,
  UpdateExpenseParams,
  DeleteExpenseParams,
} from '@domain/expense/repository/types';

export const createExpenseParams: CreateExpenseParams = {
  groupId: '10',
  body: {
    name: 'Dinner',
    amount: 60,
    date: '2025-01-15',
    paidBy: '1',
    splits: [{ participantId: '1', amount: 30 }, { participantId: '2', amount: 30 }],
    description: 'Team dinner',
  },
};

export const listExpensesParams: ListExpensesParams = { groupId: '10' };
export const getExpenseParams: GetExpenseParams = { expenseId: '100' };
export const updateExpenseParams: UpdateExpenseParams = { expenseId: '100', body: { name: 'Updated' } };
export const deleteExpenseParams: DeleteExpenseParams = { expenseId: '100' };

export function provideHappyExpenseRepository() {
  vi.mocked(mockExpenseRepository.createExpense).mockResolvedValue(expenseMock);
  vi.mocked(mockExpenseRepository.listExpenses).mockResolvedValue([expenseMock]);
  vi.mocked(mockExpenseRepository.getExpense).mockResolvedValue(expenseMock);
  vi.mocked(mockExpenseRepository.updateExpense).mockResolvedValue(expenseMock);
  vi.mocked(mockExpenseRepository.deleteExpense).mockResolvedValue(undefined);
  return mockExpenseRepository;
}

export function provideErrorExpenseRepository() {
  const err = new Error('expense error');
  vi.mocked(mockExpenseRepository.createExpense).mockRejectedValue(err);
  vi.mocked(mockExpenseRepository.listExpenses).mockRejectedValue(err);
  vi.mocked(mockExpenseRepository.getExpense).mockRejectedValue(err);
  vi.mocked(mockExpenseRepository.updateExpense).mockRejectedValue(err);
  vi.mocked(mockExpenseRepository.deleteExpense).mockRejectedValue(err);
  return mockExpenseRepository;
}
