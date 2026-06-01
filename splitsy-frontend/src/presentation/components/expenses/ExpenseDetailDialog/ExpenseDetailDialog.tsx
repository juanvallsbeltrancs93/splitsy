import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useExpenseDetailDialog } from './useExpenseDetailDialog';
import { ExpenseActionsMenu } from '../ExpenseActionsMenu';
import { ParticipantItem } from '../../shared/ParticipantItem';
import type { ExpenseDetailDialogProps } from './types';
import './styles.css';

export function ExpenseDetailDialog(props: ExpenseDetailDialogProps) {
  const {
    fullScreen,
    symbol,
    payer,
    payerName,
    payerLetter,
    formattedDate,
    payerOwed,
  } = useExpenseDetailDialog(props);

  const { open, expense, participants, currentUserId, hasPrev, hasNext, onPrev, onNext, onClose, onDelete, onEdit, onDuplicate } = props;

  if (!expense) return null;

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ padding: 0 }}>
        <div className="expense-detail__header">
          <div className="expense-detail__topbar">
            <button
              type="button"
              className="expense-detail__nav-btn"
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Previous expense"
            >
              &lt;
            </button>
            <div className="expense-detail__topbar-right">
              <button
                type="button"
                className="expense-detail__nav-btn"
                onClick={onNext}
                disabled={!hasNext}
                aria-label="Next expense"
              >
                &gt;
              </button>
              <ExpenseActionsMenu
                onEdit={() => { onEdit?.(expense); }}
                onDelete={() => { onDelete?.(expense); onClose(); }}
                onDuplicate={onDuplicate ? () => { onDuplicate(expense); onClose(); } : undefined}
              />
              <IconButton className="expense-detail__close" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          <div className="expense-detail__hero">
            <span className="expense-detail__icon">💵</span>
            <h2 className="expense-detail__title">{expense.name}</h2>
            {formattedDate && <p className="expense-detail__date">{formattedDate}</p>}
          </div>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="expense-detail__section">
          <span className="expense-detail__section-title">From</span>
          <ParticipantItem
            name={payerName}
            firstLetter={payerLetter}
            amount={String(payerOwed)}
            prefix="-"
            currencySymbol={symbol}
            variant="negative"
            isDisabled={payer != null && !payer.isActive}
          />
        </div>

        <div className="expense-detail__section">
          <span className="expense-detail__section-title">Participants</span>
          <div className="expense-detail__items">
            {expense.splits
              .filter((split) => String(split.participantId) !== String(expense.paidBy.value))
              .map((split) => {
                const participant = participants.find(
                  (p) => String(p.id) === String(split.participantId),
                );
                const name = participant?.displayName ?? 'Unknown';
                const firstLetter = name[0].toUpperCase();
                const isYou =
                  participant?.userId != null && participant.userId === currentUserId;
                return (
                  <ParticipantItem
                    key={String(split.participantId)}
                    name={name}
                    firstLetter={firstLetter}
                    amount={String(split.amount)}
                    currencySymbol={symbol}
                    isYou={isYou}
                    isDisabled={participant != null && !participant.isActive}
                  />
                );
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
