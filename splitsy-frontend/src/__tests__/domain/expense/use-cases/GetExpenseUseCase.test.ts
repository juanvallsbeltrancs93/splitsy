import { GetExpenseUseCase } from '@domain/expense/use-cases/GetExpenseUseCase';
import { expenseMock } from '../entities/Expense.test';
import { getExpenseParams, provideHappyExpenseRepository, provideErrorExpenseRepository } from './ExpenseUseCases.fixtures';

describe('Tests on GetExpenseUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return expense on success', async () => {
    const repo = provideHappyExpenseRepository();
    const result = await new GetExpenseUseCase(repo).execute(getExpenseParams);
    expect(repo.getExpense).toHaveBeenCalledWith(getExpenseParams);
    expect(result).toEqual(expenseMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorExpenseRepository();
    await expect(new GetExpenseUseCase(repo).execute(getExpenseParams)).rejects.toThrow();
  });
});
