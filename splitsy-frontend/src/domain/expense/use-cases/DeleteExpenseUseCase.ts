import type { ExpenseRepository } from '../repository/ExpenseRepository';
import type { DeleteExpenseParams } from '../repository/types';

export class DeleteExpenseUseCase {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(props: DeleteExpenseParams): Promise<void> {
    try {
      return await this.expenseRepository.deleteExpense(props);
    } catch (error) {
      throw new Error(`Error deleting expense ${props.expenseId}: ${error}`);
    }
  }
}
