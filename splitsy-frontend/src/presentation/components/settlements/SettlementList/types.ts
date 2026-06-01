import type { Settlement } from '../../../../domain/settlement/entities/Settlement';
import type { Participant } from '../../../../domain/group/entities/Participant';

export interface SettlementListProps {
  settlements: Settlement[];
  participants: Participant[];
}
