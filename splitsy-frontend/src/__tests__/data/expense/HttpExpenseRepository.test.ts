import { ExpensesApi } from '@data/apis/expenses/expensesApi';
import { GroupsApi } from '@data/apis/groups/groupsApi';
import { ExpensesApiRepository } from '@data/expense/ExpensesApiRepository';
import { Expense } from '@domain/expense/entities/Expense';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';
import {
  givenCreateExpenseSuccess,
  givenListExpensesSuccess,
  givenListExpensesError,
  givenGetExpenseSuccess,
  givenUpdateExpenseSuccess,
  givenDeleteExpenseSuccess,
} from './HttpExpenseRepository.fixtures';

const mockWebServer = new MockWebServer();
const GROUP_ID = 'grp-1';
const EXPENSE_ID = 'exp-1';

function createRepo() {
  const http = provideApi();
  return new ExpensesApiRepository(new ExpensesApi(http, new GroupsApi(http)));
}

describe('Tests on ExpensesApiRepository', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should return Expense instance on createExpense', async () => {
    givenCreateExpenseSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().createExpense({
      groupId: GROUP_ID,
      body: {
        name: 'Dinner',
        amount: 100,
        date: '2024-01-15T00:00:00Z',
        paidBy: 'user-1',
        splits: [{ participantId: 'user-1', amount: 50 }, { participantId: 'user-2', amount: 50 }],
      },
    });
    expect(result).toBeInstanceOf(Expense);
  });

  it('should return Expense[] on listExpenses', async () => {
    givenListExpensesSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().listExpenses({ groupId: GROUP_ID });
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Expense);
  });

  it('should return Expense with correct amount on listExpenses', async () => {
    givenListExpensesSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().listExpenses({ groupId: GROUP_ID });
    expect(result[0].amount).toBe(100);
  });

  it('should return Expense with correct splits length on listExpenses', async () => {
    givenListExpensesSuccess(mockWebServer, GROUP_ID);
    const result = await createRepo().listExpenses({ groupId: GROUP_ID });
    expect(result[0].splits).toHaveLength(2);
  });

  it('should return Expense with correct id on getExpense', async () => {
    givenGetExpenseSuccess(mockWebServer, EXPENSE_ID);
    const result = await createRepo().getExpense({ expenseId: EXPENSE_ID });
    expect(result).toBeInstanceOf(Expense);
    expect(result.id.value).toBe(EXPENSE_ID);
  });

  it('should return Expense on updateExpense', async () => {
    givenUpdateExpenseSuccess(mockWebServer, EXPENSE_ID);
    const result = await createRepo().updateExpense({
      expenseId: EXPENSE_ID,
      body: { name: 'Updated Dinner' },
    });
    expect(result).toBeInstanceOf(Expense);
  });

  it('should resolve without throwing on deleteExpense', async () => {
    givenDeleteExpenseSuccess(mockWebServer, EXPENSE_ID);
    await expect(createRepo().deleteExpense({ expenseId: EXPENSE_ID })).resolves.toBeUndefined();
  });

  it('should throw on listExpenses with 404', async () => {
    givenListExpensesError(mockWebServer, GROUP_ID);
    await expect(createRepo().listExpenses({ groupId: GROUP_ID })).rejects.toThrow();
  });
});
