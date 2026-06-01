import './styles.css';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { AppLayout } from '../../../components/layout/AppLayout';
import { GroupDetailView } from '../GroupDetailView/GroupDetailView';
import { AddExpenseDialog } from '../../../components/expenses/AddExpenseDialog';
import { EditExpenseDialog } from '../../../components/expenses/EditExpenseDialog';
import { ExpenseDetailDialog } from '../../../components/expenses/ExpenseDetailDialog';
import { DeleteGroupDialog } from '../../../components/groups/DeleteGroupDialog';
import { EditGroupDialog } from '../../../components/groups/EditGroupDialog';
import { DeleteExpenseDialog } from '../../../components/expenses/DeleteExpenseDialog';
import { useAuth } from '../../../utils/hooks/useAuth';
import { useGroupState } from './useGroupState';
import { useExpenseList } from './useExpenseList';
import { useGroupDetailDialogs } from './useGroupDetailDialogs';
import { useShareInviteLink } from './useShareInviteLink';

export function GroupDetailPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    group,
    balances,
    settlements,
    activeTab,
    setActiveTab,
    refreshBalances,
    refreshSettlements,
    handleGroupUpdated,
  } = useGroupState();

  const {
    sortedExpenses,
    selectedExpense,
    hasPrev,
    hasNext,
    onExpenseCreated,
    onExpenseClick,
    onExpenseDetailClose,
    onPrev,
    onNext,
    applyExpenseEdit,
    applyExpenseDelete,
  } = useExpenseList(refreshBalances);

  const {
    isDeleteDialogOpen,
    isEditDialogOpen,
    isAddExpenseOpen,
    expenseToDelete,
    expenseToEdit,
    expenseToDuplicate,
    handleOpenAddExpense,
    handleCloseAddExpense,
    handleEditGroup,
    handleCloseEditDialog,
    handleDeleteGroup,
    handleCancelDelete,
    handleEditExpense,
    handleDuplicateExpense,
    handleCancelEditExpense,
    handleDeleteExpense,
    handleCancelDeleteExpense,
  } = useGroupDetailDialogs();

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSettlementCreated = useCallback(() => {
    refreshBalances();
    refreshSettlements();
  }, [refreshBalances, refreshSettlements]);

  const { handleShare: handleShareGroup } = useShareInviteLink(group.id);

  const currentUserId = user?.id?.value ?? null;
  const currentParticipant = group.participants.find((p) => p.userId === currentUserId);
  const isOwner = !!currentParticipant && group.ownerId === currentParticipant.id;

  return (
    <AppLayout>
      <GroupDetailView
        group={group}
        expenses={sortedExpenses}
        settlements={settlements}
        balances={balances}
        activeTab={activeTab}
        currencyCode={group.currency}
        onTabChange={setActiveTab}
        onBack={handleBack}
        onAddExpense={handleOpenAddExpense}
        onExpenseClick={onExpenseClick}
        onDeleteExpense={handleDeleteExpense}
        onEditExpense={handleEditExpense}
        onDuplicateExpense={handleDuplicateExpense}
        onEditGroup={handleEditGroup}
        onDeleteGroup={isOwner ? handleDeleteGroup : undefined}
        onShareGroup={handleShareGroup}
        onSettlementCreated={handleSettlementCreated}
      />
      <AddExpenseDialog
        open={isAddExpenseOpen}
        onClose={handleCloseAddExpense}
        onExpenseCreated={onExpenseCreated}
        initialExpense={expenseToDuplicate ?? undefined}
        group={group}
      />
      <EditExpenseDialog
        open={expenseToEdit !== null}
        expense={expenseToEdit}
        participants={group.activeParticipants}
        currencyCode={group.currency}
        onClose={handleCancelEditExpense}
        onSuccess={applyExpenseEdit}
      />
      <ExpenseDetailDialog
        open={selectedExpense !== null}
        expense={selectedExpense}
        participants={group.participants}
        currencyCode={group.currency}
        currentUserId={currentUserId}
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={onPrev}
        onNext={onNext}
        onClose={onExpenseDetailClose}
        onDelete={handleDeleteExpense}
        onEdit={handleEditExpense}
        onDuplicate={handleDuplicateExpense}
      />
      <DeleteGroupDialog
        groupId={group.id}
        open={isDeleteDialogOpen}
        groupName={group.name}
        onClose={handleCancelDelete}
      />
      <EditGroupDialog
        open={isEditDialogOpen}
        group={group}
        onClose={handleCloseEditDialog}
        onSuccess={(updatedGroup) => {
          handleGroupUpdated(updatedGroup);
          refreshBalances();
        }}
      />
      <DeleteExpenseDialog
        open={expenseToDelete !== null}
        expenseId={expenseToDelete?.id.value ?? ''}
        expenseName={expenseToDelete?.name ?? ''}
        onSuccess={() => expenseToDelete && applyExpenseDelete(expenseToDelete)}
        onClose={handleCancelDeleteExpense}
      />
    </AppLayout>
  );
}
