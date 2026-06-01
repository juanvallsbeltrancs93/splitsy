import type { ExpenseRepository } from '../../domain/expense/repository/ExpenseRepository';
import type {
  CreateExpenseParams,
  DeleteExpenseParams,
  GetExpenseParams,
  ListExpensesParams,
  UpdateExpenseParams,
} from '../../domain/expense/repository/types';
import { Expense } from '../../domain/expense/entities/Expense';
import type { ExpensesApi } from '../apis/expenses/expensesApi';
import type { ExpenseResponseDto } from '../apis/expenses/types';
import { translateApiError } from '../shared/translateApiError';

function mapExpense(dto: ExpenseResponseDto): Expense {
  return Expense.create({
    id: dto.id,
    groupId: dto.group_id,
    name: dto.name,
    amount: dto.amount,
    date: dto.date,
    paidBy: dto.paid_by,
    splits: dto.splits.map((s) => ({
      participantId: s.participant_id,
      amount: s.amount,
    })),
    description: dto.description ?? undefined,
  });
}

export class ExpensesApiRepository implements ExpenseRepository {
  constructor(private readonly api: ExpensesApi) {}

  async createExpense(params: CreateExpenseParams): Promise<Expense> {
    try {
      const dto = await this.api.create(params.groupId, {
        name: params.body.name,
        amount: params.body.amount,
        date: params.body.date,
        paid_by: params.body.paidBy,
        splits: params.body.splits.map((s) => ({
          participant_id: s.participantId,
          amount: s.amount,
        })),
        description: params.body.description,
      });
      return mapExpense(dto);
    } catch (error) {
      translateApiError(error, 'Expense');
    }
  }

  async listExpenses(params: ListExpensesParams): Promise<Expense[]> {
    try {
      const dtos = await this.api.list(params.groupId);
      return dtos.map(mapExpense);
    } catch (error) {
      translateApiError(error, 'Expense');
    }
  }

  async getExpense(params: GetExpenseParams): Promise<Expense> {
    try {
      const dto = await this.api.get(params.expenseId);
      return mapExpense(dto);
    } catch (error) {
      translateApiError(error, 'Expense', params.expenseId);
    }
  }

  async updateExpense(params: UpdateExpenseParams): Promise<Expense> {
    const body: Record<string, unknown> = {};
    if (params.body.name !== undefined) body.name = params.body.name;
    if (params.body.amount !== undefined) body.amount = params.body.amount;
    if (params.body.date !== undefined) body.date = params.body.date;
    if (params.body.paidBy !== undefined) body.paid_by = params.body.paidBy;
    if (params.body.splits !== undefined) {
      body.splits = params.body.splits.map((s) => ({
        participant_id: s.participantId,
        amount: s.amount,
      }));
    }
    if (params.body.description !== undefined) body.description = params.body.description;

    try {
      const dto = await this.api.update(params.expenseId, body);
      return mapExpense(dto);
    } catch (error) {
      translateApiError(error, 'Expense', params.expenseId);
    }
  }

  async deleteExpense(params: DeleteExpenseParams): Promise<void> {
    try {
      await this.api.delete(params.expenseId);
    } catch (error) {
      translateApiError(error, 'Expense', params.expenseId);
    }
  }
}
