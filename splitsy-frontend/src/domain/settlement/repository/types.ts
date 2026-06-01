interface CreateSettlementBody {
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CreateSettlementParams {
  groupId: string;
  body: CreateSettlementBody;
}

export interface ListSettlementsParams {
  groupId: string;
}
