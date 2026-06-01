import { CreateExpenseUseCase } from '@domain/expense/use-cases/CreateExpenseUseCase';
import { expenseMock } from '../entities/Expense.test';
import { createExpenseParams, provideHappyExpenseRepository, provideErrorExpenseRepository } from './ExpenseUseCases.fixtures';

describe('Tests on CreateExpenseUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return expense on success', async () => {
    const repo = provideHappyExpenseRepository();
    const result = await new CreateExpenseUseCase(repo).execute(createExpenseParams);
    expect(repo.createExpense).toHaveBeenCalledWith(createExpenseParams);
    expect(result).toEqual(expenseMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorExpenseRepository();
    await expect(new CreateExpenseUseCase(repo).execute(createExpenseParams)).rejects.toThrow();
  });
});
