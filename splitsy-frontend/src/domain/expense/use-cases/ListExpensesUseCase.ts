import type { ExpenseRepository } from '../repository/ExpenseRepository';
import type { Expense } from '../entities/Expense';
import type { ListExpensesParams } from '../repository/types';

export class ListExpensesUseCase {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(props: ListExpensesParams): Promise<Expense[]> {
    try {
      return await this.expenseRepository.listExpenses(props);
    } catch (error) {
      throw new Error(`Error listing expenses: ${error}`);
    }
  }
}
