import type { AxiosInstance } from 'axios';
import type { GroupsApi } from '../groups/groupsApi';
import type { CreateSettlementRequestDto, SettlementResponseDto } from './types';

export class SettlementsApi {
  private settlementsByGroupCache: Record<string, SettlementResponseDto[]> = {};

  constructor(
    private readonly http: AxiosInstance,
    private readonly groupsApi?: GroupsApi,
  ) {}

  async create(groupId: string, data: CreateSettlementRequestDto): Promise<SettlementResponseDto> {
    const response = await this.http.post(`/settlements/group/${groupId}`, data);
    const dto: SettlementResponseDto = response.data;
    const list = this.settlementsByGroupCache[groupId] ?? [];
    list.push(dto);
    this.settlementsByGroupCache[groupId] = list;
    this.groupsApi?.invalidateBalances(groupId);
    return dto;
  }

  async list(groupId: string): Promise<SettlementResponseDto[]> {
    const cached = this.settlementsByGroupCache[groupId];
    if (cached) {
      return cached;
    }
    const response = await this.http.get(`/settlements/group/${groupId}`);
    const dtos: SettlementResponseDto[] = response.data;
    this.settlementsByGroupCache[groupId] = dtos;
    return dtos;
  }

  invalidateSettlements(groupId: string): void {
    delete this.settlementsByGroupCache[groupId];
  }
}
