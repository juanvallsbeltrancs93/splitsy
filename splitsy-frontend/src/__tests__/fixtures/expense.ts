import { Expense } from '@/domain/expense/entities/Expense';
import type { ExpenseProps } from '@/domain/expense/entities/Expense';

export function provideExpenseFixture(data: Partial<ExpenseProps> = {}): Expense {
  return Expense.create({
    id: 'expense-1',
    groupId: 'group-1',
    name: 'Test Expense',
    amount: 100,
    date: '2024-01-01',
    paidBy: 'user-1',
    splits: [],
    ...data,
  });
}

export function provideExpenseWithEqualSplit(data: Partial<ExpenseProps> = {}): Expense {
  return Expense.create({
    id: 'expense-1',
    groupId: 'group-1',
    name: 'Dinner',
    amount: 120,
    date: '2024-06-15',
    paidBy: 'p1',
    splits: [
      { participantId: 'p1', amount: 40 },
      { participantId: 'p2', amount: 40 },
      { participantId: 'p3', amount: 40 },
    ],
    description: 'Team dinner',
    ...data,
  });
}

export function provideExpenseWithUnevenSplit(data: Partial<ExpenseProps> = {}): Expense {
  return Expense.create({
    id: 'expense-2',
    groupId: 'group-1',
    name: 'Groceries',
    amount: 85.50,
    date: '2024-06-10',
    paidBy: 'p2',
    splits: [
      { participantId: 'p1', amount: 25.50 },
      { participantId: 'p2', amount: 35.00 },
      { participantId: 'p3', amount: 25.00 },
    ],
    ...data,
  });
}

export function provideExpenseList(): Expense[] {
  return [
    provideExpenseWithEqualSplit({ id: 'e1', name: 'Pizza', amount: 45, date: '2024-06-20', paidBy: 'p1' }),
    provideExpenseWithUnevenSplit({ id: 'e2', name: 'Groceries', amount: 80, date: '2024-06-18', paidBy: 'p2' }),
    provideExpenseFixture({ id: 'e3', name: 'Taxi', amount: 25, date: '2024-06-15', paidBy: 'p3' }),
  ];
}
