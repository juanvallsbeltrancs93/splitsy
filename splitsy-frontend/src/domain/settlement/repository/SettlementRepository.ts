import type { Settlement } from "../entities/Settlement";
import type { CreateSettlementParams, ListSettlementsParams } from "./types";

export interface SettlementRepository {
  createSettlement(params: CreateSettlementParams): Promise<Settlement>;
  listSettlements(params: ListSettlementsParams): Promise<Settlement[]>;
}
