import type { ExpenseRepository } from '../repository/ExpenseRepository';
import type { Expense } from '../entities/Expense';
import type { CreateExpenseParams } from '../repository/types';

export class CreateExpenseUseCase {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(props: CreateExpenseParams): Promise<Expense> {
    try {
      return await this.expenseRepository.createExpense(props);
    } catch (error) {
      throw new Error(`Error creating expense: ${error}`);
    }
  }
}
