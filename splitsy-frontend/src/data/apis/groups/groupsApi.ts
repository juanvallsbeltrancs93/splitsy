import type { AxiosInstance } from 'axios';
import type {
  AddParticipantRequestDto,
  BalanceResponseDto,
  CreateGroupRequestDto,
  GroupResponseDto,
  UpdateGroupRequestDto,
} from './types';

export class GroupsApi {
  private groupsCache: GroupResponseDto[] = [];
  private balancesCache: Record<string, BalanceResponseDto[]> = {};

  constructor(private readonly http: AxiosInstance) {}

  private _updateCacheItem(dto: GroupResponseDto): void {
    const index = this.groupsCache.findIndex((g) => g.id === dto.id);
    if (index >= 0) {
      this.groupsCache[index] = dto;
    } else {
      this.groupsCache.push(dto);
    }
  }

  private _removeCacheItem(id: string): void {
    this.groupsCache = this.groupsCache.filter((g) => g.id !== id);
  }

  async list(): Promise<GroupResponseDto[]> {
    const response = await this.http.get('/groups');
    this.groupsCache = response.data;
    return this.groupsCache;
  }

  async create(data: CreateGroupRequestDto): Promise<GroupResponseDto> {
    const response = await this.http.post('/groups', data);
    const dto: GroupResponseDto = response.data;
    this.groupsCache.push(dto);
    return dto;
  }

  async get(groupId: string): Promise<GroupResponseDto> {
    const cached = this.groupsCache.find((g) => g.id === groupId);
    if (cached) {
      return cached;
    }
    const response = await this.http.get(`/groups/${groupId}`);
    const dto: GroupResponseDto = response.data;
    this._updateCacheItem(dto);
    return dto;
  }

  async update(groupId: string, data: UpdateGroupRequestDto): Promise<GroupResponseDto> {
    const response = await this.http.patch(`/groups/${groupId}`, data);
    const dto: GroupResponseDto = response.data;
    this._updateCacheItem(dto);
    return dto;
  }

  async delete(groupId: string): Promise<void> {
    await this.http.delete(`/groups/${groupId}`);
    this._removeCacheItem(groupId);
  }

  async addParticipant(groupId: string, data: AddParticipantRequestDto): Promise<GroupResponseDto> {
    const response = await this.http.post(`/groups/${groupId}/participants`, data);
    const dto: GroupResponseDto = response.data;
    this._updateCacheItem(dto);
    this.invalidateBalances(groupId);
    return dto;
  }

  async removeParticipant(groupId: string, participantId: string): Promise<GroupResponseDto> {
    const response = await this.http.delete(`/groups/${groupId}/participants/${participantId}`);
    const dto: GroupResponseDto = response.data;
    this._updateCacheItem(dto);
    return dto;
  }

  async getBalances(groupId: string): Promise<BalanceResponseDto[]> {
    const cached = this.balancesCache[groupId];
    if (cached) {
      return cached;
    }
    const response = await this.http.get(`/groups/${groupId}/balances`);
    this.balancesCache[groupId] = response.data;
    return this.balancesCache[groupId];
  }

  invalidateBalances(groupId: string): void {
    delete this.balancesCache[groupId];
  }

  async claimParticipant(groupId: string, participantId: string): Promise<GroupResponseDto> {
    const response = await this.http.post(`/groups/${groupId}/claim/${participantId}`, {});
    const dto: GroupResponseDto = response.data;
    this._updateCacheItem(dto);
    return dto;
  }
}
