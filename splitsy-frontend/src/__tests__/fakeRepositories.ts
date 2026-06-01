import { vi } from 'vitest';
import type { AuthRepository } from '@domain/auth/repository/AuthRepository';
import type { UserRepository } from '@domain/users/repository/UserRepository';
import type { GroupRepository } from '@domain/group/repository/GroupRepository';
import type { ExpenseRepository } from '@domain/expense/repository/ExpenseRepository';
import type { SettlementRepository } from '@domain/settlement/repository/SettlementRepository';

export const mockAuthRepository: AuthRepository = {
  login: vi.fn(),
  register: vi.fn(),
};

export const mockUserRepository: UserRepository = {
  getMe: vi.fn(),
};

export const mockGroupRepository: GroupRepository = {
  listGroups: vi.fn(),
  createGroup: vi.fn(),
  getGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  addParticipant: vi.fn(),
  removeParticipant: vi.fn(),
  getBalances: vi.fn(),
  claimParticipant: vi.fn(),
};

export const mockExpenseRepository: ExpenseRepository = {
  createExpense: vi.fn(),
  listExpenses: vi.fn(),
  getExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
};

export const mockSettlementRepository: SettlementRepository = {
  createSettlement: vi.fn(),
  listSettlements: vi.fn(),
};
