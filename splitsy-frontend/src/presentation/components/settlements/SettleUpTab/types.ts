import type { Settlement } from '@/domain/settlement/entities/Settlement';
import type { UserBalance } from '@/domain/group/entities/UserBalance';
import type { Participant } from '@/domain/group/entities/Participant';
import type { SettlementPlanItem } from '@/presentation/utils/calculateSettlementPlan';

export interface SettleUpTabProps {
  balances: UserBalance[];
  participants: Participant[];
  settlements: Settlement[];
  currencyCode: string;
  groupId: string;
  onSettlementCreated: () => void;
}

export interface UseSettleUpTabReturn {
  plan: SettlementPlanItem[];
  isAllSettled: boolean;
  getParticipantName: (id: string) => string;
  currencySymbol: string;
  selectedPlanItem: SettlementPlanItem | null;
  isDialogOpen: boolean;
  onRecordClick: (item: SettlementPlanItem) => void;
  onCloseDialog: () => void;
  onSettlementCreated: () => void;
}
