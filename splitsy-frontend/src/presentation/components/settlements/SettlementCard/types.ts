import type { Settlement } from '../../../../domain/settlement/entities/Settlement';
import type { Participant } from '../../../../domain/group/entities/Participant';

export interface SettlementCardProps {
  settlement: Settlement;
  participants: Participant[];
}

export interface UseSettlementCardReturn {
  fromName: string;
  toName: string;
  formattedDate: string;
}
