export interface SettlementResponseDto {
  id: string;
  group_id: string;
  from_participant_id: string;
  to_participant_id: string;
  amount: number;
  date: string;
  note: string | null;
}

export interface CreateSettlementRequestDto {
  from_participant_id: string;
  to_participant_id: string;
  amount: number;
  date: string;
  note?: string;
}
