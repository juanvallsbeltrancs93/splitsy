import { DeleteExpenseUseCase } from '@domain/expense/use-cases/DeleteExpenseUseCase';
import { deleteExpenseParams, provideHappyExpenseRepository, provideErrorExpenseRepository } from './ExpenseUseCases.fixtures';

describe('Tests on DeleteExpenseUseCase', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should call deleteExpense on success', async () => {
    const repo = provideHappyExpenseRepository();
    await new DeleteExpenseUseCase(repo).execute(deleteExpenseParams);
    expect(repo.deleteExpense).toHaveBeenCalledWith(deleteExpenseParams);
  });

  it('should throw when repository fails', async () => {
    const repo = provideErrorExpenseRepository();
    await expect(new DeleteExpenseUseCase(repo).execute(deleteExpenseParams)).rejects.toThrow();
  });
});
