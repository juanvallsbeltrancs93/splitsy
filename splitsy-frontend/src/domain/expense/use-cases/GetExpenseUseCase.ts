import type { ExpenseRepository } from '../repository/ExpenseRepository';
import type { Expense } from '../entities/Expense';
import type { GetExpenseParams } from '../repository/types';

export class GetExpenseUseCase {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(props: GetExpenseParams): Promise<Expense> {
    try {
      return await this.expenseRepository.getExpense(props);
    } catch (error) {
      throw new Error(`Error getting expense ${props.expenseId}: ${error}`);
    }
  }
}
