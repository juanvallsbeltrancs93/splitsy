import { Expense } from '@domain/expense/entities/Expense';
import type { ExpenseProps } from '@domain/expense/entities/Expense';

export const expensePropsMock: ExpenseProps = {
  id: '100',
  groupId: '10',
  name: 'Dinner',
  amount: 60,
  date: '2025-01-15',
  paidBy: '1',
  splits: [
    { participantId: '1', amount: 30 },
    { participantId: '2', amount: 30 },
  ],
  description: 'Team dinner',
};

export const expenseMock = Expense.create(expensePropsMock);

describe('Tests on Expense entity', () => {
  it('should create an Expense with all fields', () => {
    const expense = Expense.create(expensePropsMock);
    expect(expense.id.value).toBe('100');
    expect(expense.groupId.value).toBe('10');
    expect(expense.name).toBe('Dinner');
    expect(expense.amount).toBe(60);
    expect(expense.date).toBe('2025-01-15');
    expect(expense.paidBy.value).toBe('1');
    expect(expense.splits).toHaveLength(2);
    expect(expense.description).toBe('Team dinner');
  });

  it('should create without id (generates one)', () => {
    const { id: _, ...propsWithoutId } = expensePropsMock;
    const expense = Expense.create(propsWithoutId);
    expect(expense.id.value).toBeDefined();
    expect(expense.id.value.length).toBeGreaterThan(0);
  });

  it('should map splits to Split instances', () => {
    const expense = Expense.create(expensePropsMock);
    expect(expense.splits[0].participantId).toBe('1');
    expect(expense.splits[0].amount).toBe(30);
  });

  it('should handle optional description as undefined', () => {
    const { description: _, ...propsNoDesc } = expensePropsMock;
    const expense = Expense.create(propsNoDesc);
    expect(expense.description).toBeUndefined();
  });
});
