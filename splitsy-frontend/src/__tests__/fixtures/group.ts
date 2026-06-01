import { Group } from '@/domain/group/entities/Group';
import type { GroupProps } from '@/domain/group/entities/Group';
import { Expense } from '@/domain/expense/entities/Expense';
import type { ExpenseProps } from '@/domain/expense/entities/Expense';
import { UserBalance } from '@/domain/group/entities/UserBalance';
import type { UserBalanceProps } from '@/domain/group/entities/UserBalance';
import { Participant } from '@/domain/group/entities/Participant';
import type { ParticipantProps } from '@/domain/group/entities/Participant';

export function provideParticipant(data: Partial<ParticipantProps> = {}): Participant {
  return Participant.create({
    id: 'user-1',
    displayName: 'Alice',
    type: 'REGISTERED',
    ...data,
  });
}

export function provideGroup(data: Partial<GroupProps> = {}): Group {
  return Group.create({
    id: 'group-1',
    name: 'Test Group',
    currency: 'USD',
    participants: [],
    ...data,
  });
}

export function provideGroupWithParticipants(data: Partial<GroupProps> = {}): Group {
  return Group.create({
    id: 'group-1',
    name: 'Dinner Group',
    currency: 'USD',
    participants: [
      provideParticipant({ id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' }),
      provideParticipant({ id: 'p2', displayName: 'Bob', type: 'REGISTERED', userId: 'user-2' }),
      provideParticipant({ id: 'p3', displayName: 'Charlie', type: 'NON_REGISTERED' }),
    ],
    ...data,
  });
}

export function provideExpense(data: Partial<ExpenseProps> = {}): Expense {
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

export function provideExpenseWithSplits(data: Partial<ExpenseProps> = {}): Expense {
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
    description: 'Team dinner at the Italian place',
    ...data,
  });
}

export function provideUserBalance(data: Partial<UserBalanceProps> = {}): UserBalance {
  return UserBalance.create({
    participantId: 'user-1',
    balance: 50,
    ...data,
  });
}

export function provideMultipleExpenses(): Expense[] {
  return [
    provideExpenseWithSplits({ id: 'e1', name: 'Pizza Night', amount: 45, date: '2024-06-20', paidBy: 'p1' }),
    provideExpenseWithSplits({ id: 'e2', name: 'Groceries', amount: 80, date: '2024-06-18', paidBy: 'p2', splits: [
      { participantId: 'p1', amount: 20 },
      { participantId: 'p2', amount: 30 },
      { participantId: 'p3', amount: 30 },
    ] }),
    provideExpenseWithSplits({ id: 'e3', name: 'Taxi Ride', amount: 25, date: '2024-06-15', paidBy: 'p3', splits: [
      { participantId: 'p1', amount: 10 },
      { participantId: 'p2', amount: 5 },
      { participantId: 'p3', amount: 10 },
    ] }),
  ];
}

export function provideMultipleBalances(): UserBalance[] {
  return [
    provideUserBalance({ participantId: 'p1', balance: 15 }),
    provideUserBalance({ participantId: 'p2', balance: -20 }),
    provideUserBalance({ participantId: 'p3', balance: 5 }),
  ];
}
