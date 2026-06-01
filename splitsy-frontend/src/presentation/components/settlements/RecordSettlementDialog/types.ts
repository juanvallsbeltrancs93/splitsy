import type { SettlementPlanItem } from '@/presentation/utils/calculateSettlementPlan';
import type { Participant } from '@/domain/group/entities/Participant';

export interface RecordSettlementDialogProps {
  open: boolean;
  planItem: SettlementPlanItem;
  participants: Participant[];
  currencyCode: string;
  groupId: string;
  onClose: () => void;
  onSettlementCreated: () => void;
}

export interface UseRecordSettlementDialogReturn {
  isLoading: boolean;
  note: string;
  date: string;
  submitError: string | null;
  fromName: string;
  toName: string;
  amount: number;
  currencySymbol: string;
  onNoteChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}
