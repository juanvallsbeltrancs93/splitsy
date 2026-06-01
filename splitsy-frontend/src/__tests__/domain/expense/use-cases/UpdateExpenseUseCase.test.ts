import { UpdateExpenseUseCase } from '@domain/expense/use-cases/UpdateExpenseUseCase';
import { expenseMock } from '../entities/Expense.test';
import { updateExpenseParams, provideHappyExpenseRepository, provideErrorExpenseRepository } from './ExpenseUseCases.fixtures';

describe('Tests on UpdateExpenseUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return updated expense on success', async () => {
    const repo = provideHappyExpenseRepository();
    const result = await new UpdateExpenseUseCase(repo).execute(updateExpenseParams);
    expect(repo.updateExpense).toHaveBeenCalledWith(updateExpenseParams);
    expect(result).toEqual(expenseMock);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorExpenseRepository();
    await expect(new UpdateExpenseUseCase(repo).execute(updateExpenseParams)).rejects.toThrow();
  });
});
