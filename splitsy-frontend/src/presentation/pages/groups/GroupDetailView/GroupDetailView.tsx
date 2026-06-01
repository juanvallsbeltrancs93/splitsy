import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ExpenseList } from '../../../components/expenses/ExpenseList';
import { BalanceList } from '../../../components/settlements/BalanceList';
import { SettleUpTab } from '../../../components/settlements/SettleUpTab';
import { GroupActionsMenu } from '../../../components/groups/GroupActionsMenu';
import type { GroupDetailViewProps } from './types';
import './styles.css';

export function GroupDetailView({
  group,
  expenses,
  settlements,
  balances,
  activeTab,
  currencyCode,
  onTabChange,
  onBack,
  onAddExpense,
  onExpenseClick,
  onDeleteExpense,
  onEditExpense,
  onDuplicateExpense,
  onEditGroup,
  onDeleteGroup,
  onShareGroup,
  onSettlementCreated,
}: GroupDetailViewProps) {
  return (
    <div>
      <div className="group-detail__header">
        <button className="group-detail__back" onClick={onBack}>
          <ArrowBackIcon />
        </button>

        <h4 className="group-detail__title">{group.name}</h4>

        {(onEditGroup || onDeleteGroup || onShareGroup) && (
          <GroupActionsMenu
            onEdit={onEditGroup ?? (() => {})}
            onDelete={onDeleteGroup}
            onShare={onShareGroup}
          />
        )}
      </div>

      <div className="group-detail__tabs">
        <Tabs
          value={activeTab}
          onChange={(_, value) => onTabChange(value)}
        >
          <Tab label="Expenses" />
          <Tab label="Debts" />
          <Tab label="Settlements" />
        </Tabs>
      </div>

      {activeTab === 0 && (
        <ExpenseList
          expenses={expenses}
          participants={group.participants}
          currencyCode={currencyCode}
          onExpenseClick={onExpenseClick}
          onDeleteExpense={onDeleteExpense}
          onEditExpense={onEditExpense}
          onDuplicateExpense={onDuplicateExpense}
        />
      )}

      {activeTab === 1 && (
        <BalanceList
          balances={balances}
          participants={group.participants}
          currencyCode={currencyCode}
        />
      )}

      {activeTab === 2 && (
        <SettleUpTab
          balances={balances}
          participants={group.participants}
          settlements={settlements}
          currencyCode={currencyCode}
          groupId={group.id}
          onSettlementCreated={onSettlementCreated ?? (() => {})}
        />
      )}

      <button className="group-detail__add-btn" onClick={onAddExpense} aria-label="Add expense">
        +
      </button>
    </div>
  );
}
