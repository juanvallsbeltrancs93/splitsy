import type { Group } from '../../../../domain/group/entities/Group';
import type { Expense } from '../../../../domain/expense/entities/Expense';
import type { Settlement } from '../../../../domain/settlement/entities/Settlement';
import type { UserBalance } from '../../../../domain/group/entities/UserBalance';

export interface GroupDetailViewProps {
  group: Group;
  expenses: Expense[];
  settlements: Settlement[];
  balances: UserBalance[];
  activeTab: number;
  currencyCode: string;
  onTabChange: (tab: number) => void;
  onBack: () => void;
  onAddExpense: () => void;
  onExpenseClick: (expense: Expense) => void;
  onDeleteExpense?: (expense: Expense) => void;
  onEditExpense?: (expense: Expense) => void;
  onDuplicateExpense?: (expense: Expense) => void;
  onEditGroup?: () => void;
  onDeleteGroup?: () => void;
  onShareGroup?: () => void;
  onSettlementCreated?: () => void;
}
