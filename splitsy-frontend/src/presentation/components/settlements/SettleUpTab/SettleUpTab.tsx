import { SettlementList } from '../SettlementList';
import { RecordSettlementDialog } from '../RecordSettlementDialog';
import { useSettleUpTab } from './useSettleUpTab';
import type { SettleUpTabProps } from './types';
import './styles.css';

export function SettleUpTab(props: SettleUpTabProps) {
  const {
    settlements,
    participants,
    groupId,
  } = props;

  const {
    plan,
    isAllSettled,
    getParticipantName,
    currencySymbol,
    selectedPlanItem,
    isDialogOpen,
    onRecordClick,
    onCloseDialog,
    onSettlementCreated,
  } = useSettleUpTab(props);

  return (
    <div className="settle-up-tab">
      <div className="settle-up-tab__section">
        <div className="settle-up-tab__section-title">Settlement Plan</div>

        {isAllSettled ? (
          <div className="settle-up-tab__empty">
            <span className="settle-up-tab__empty-title">
              All settled up! 🎉
            </span>
          </div>
        ) : (
          <div className="settle-up-tab__plan">
            {plan.map((item, index) => (
              <div key={index} className="settle-up-tab__plan-item">
                <div className="settle-up-tab__plan-content">
                  <span className="settle-up-tab__plan-names">
                    {getParticipantName(item.fromParticipantId)} →{' '}
                    {getParticipantName(item.toParticipantId)}
                  </span>
                  <span className="settle-up-tab__plan-amount">
                    {currencySymbol}
                    {item.amount.toFixed(2)}
                  </span>
                </div>
                <button
                  className="settle-up-tab__record-btn"
                  onClick={() => onRecordClick(item)}
                >
                  Record Payment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {settlements.length > 0 && (
        <div className="settle-up-tab__section">
          <div className="settle-up-tab__section-title">History</div>
          <SettlementList
            settlements={settlements}
            participants={participants}
          />
        </div>
      )}

      {isDialogOpen && selectedPlanItem && (
        <RecordSettlementDialog
          open={isDialogOpen}
          planItem={selectedPlanItem}
          participants={participants}
          currencyCode={props.currencyCode}
          groupId={groupId}
          onClose={onCloseDialog}
          onSettlementCreated={onSettlementCreated}
        />
      )}
    </div>
  );
}
