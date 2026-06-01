import type { ExpenseRepository } from '../repository/ExpenseRepository';
import type { Expense } from '../entities/Expense';
import type { UpdateExpenseParams } from '../repository/types';

export class UpdateExpenseUseCase {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(props: UpdateExpenseParams): Promise<Expense> {
    try {
      return await this.expenseRepository.updateExpense(props);
    } catch (error) {
      throw new Error(`Error updating expense ${props.expenseId}: ${error}`);
    }
  }
}
