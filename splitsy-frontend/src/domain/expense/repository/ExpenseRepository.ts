import type { Expense } from "../entities/Expense";
import type {
  CreateExpenseParams,
  DeleteExpenseParams,
  GetExpenseParams,
  ListExpensesParams,
  UpdateExpenseParams,
} from "./types";

export interface ExpenseRepository {
  createExpense(params: CreateExpenseParams): Promise<Expense>;
  listExpenses(params: ListExpensesParams): Promise<Expense[]>;
  getExpense(params: GetExpenseParams): Promise<Expense>;
  updateExpense(params: UpdateExpenseParams): Promise<Expense>;
  deleteExpense(params: DeleteExpenseParams): Promise<void>;
}
