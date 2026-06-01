import { ListExpensesUseCase } from '@domain/expense/use-cases/ListExpensesUseCase';
import { expenseMock } from '../entities/Expense.test';
import { listExpensesParams, provideHappyExpenseRepository, provideErrorExpenseRepository } from './ExpenseUseCases.fixtures';

describe('Tests on ListExpensesUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return expenses on success', async () => {
    const repo = provideHappyExpenseRepository();
    const result = await new ListExpensesUseCase(repo).execute(listExpensesParams);
    expect(repo.listExpenses).toHaveBeenCalledWith(listExpensesParams);
    expect(result).toEqual([expenseMock]);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorExpenseRepository();
    await expect(new ListExpensesUseCase(repo).execute(listExpensesParams)).rejects.toThrow();
  });
});
