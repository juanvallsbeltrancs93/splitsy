import type { Group } from '@/domain/group/entities/Group';
import type { Expense } from '@/domain/expense/entities/Expense';
import type { Settlement } from '@/domain/settlement/entities/Settlement';
import type { UserBalance } from '@/domain/group/entities/UserBalance';

export interface GroupDetailLoaderData {
  group: Group;
  expenses: Expense[];
  settlements: Settlement[];
  balances: UserBalance[];
}
