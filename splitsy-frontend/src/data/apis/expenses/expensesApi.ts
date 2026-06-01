import type { AxiosInstance } from 'axios';
import type { GroupsApi } from '../groups/groupsApi';
import type {
  CreateExpenseRequestDto,
  ExpenseResponseDto,
  UpdateExpenseRequestDto,
} from './types';

export class ExpensesApi {
  private expensesByGroupCache: Record<string, ExpenseResponseDto[]> = {};
  private expenseCache: Record<string, ExpenseResponseDto> = {};

  constructor(
    private readonly http: AxiosInstance,
    private readonly groupsApi?: GroupsApi,
  ) {}

  private _updateCacheItem(dto: ExpenseResponseDto): void {
    const list = this.expensesByGroupCache[dto.group_id] ?? [];
    const index = list.findIndex((e) => e.id === dto.id);
    if (index >= 0) {
      list[index] = dto;
    } else {
      list.push(dto);
    }
    this.expensesByGroupCache[dto.group_id] = list;
    this.expenseCache[dto.id] = dto;
  }

  private _removeCacheItem(expenseId: string): void {
    const dto = this.expenseCache[expenseId];
    if (dto) {
      const list = this.expensesByGroupCache[dto.group_id] ?? [];
      this.expensesByGroupCache[dto.group_id] = list.filter((e) => e.id !== expenseId);
      delete this.expenseCache[expenseId];
    }
  }

  async create(groupId: string, data: CreateExpenseRequestDto): Promise<ExpenseResponseDto> {
    const response = await this.http.post(`/expenses/group/${groupId}`, data);
    const dto: ExpenseResponseDto = response.data;
    this._updateCacheItem(dto);
    this.groupsApi?.invalidateBalances(groupId);
    return dto;
  }

  async list(groupId: string): Promise<ExpenseResponseDto[]> {
    const cached = this.expensesByGroupCache[groupId];
    if (cached) {
      return cached;
    }
    const response = await this.http.get(`/expenses/group/${groupId}`);
    const dtos: ExpenseResponseDto[] = response.data;
    this.expensesByGroupCache[groupId] = dtos;
    for (const dto of dtos) {
      this.expenseCache[dto.id] = dto;
    }
    return dtos;
  }

  async get(expenseId: string): Promise<ExpenseResponseDto> {
    const cached = this.expenseCache[expenseId];
    if (cached) {
      return cached;
    }
    const response = await this.http.get(`/expenses/${expenseId}`);
    const dto: ExpenseResponseDto = response.data;
    this.expenseCache[expenseId] = dto;
    return dto;
  }

  async update(expenseId: string, data: UpdateExpenseRequestDto): Promise<ExpenseResponseDto> {
    const response = await this.http.patch(`/expenses/${expenseId}`, data);
    const dto: ExpenseResponseDto = response.data;
    this._updateCacheItem(dto);
    this.groupsApi?.invalidateBalances(dto.group_id);
    return dto;
  }

  async delete(expenseId: string): Promise<void> {
    const dto = this.expenseCache[expenseId];
    await this.http.delete(`/expenses/${expenseId}`);
    this._removeCacheItem(expenseId);
    if (dto) {
      this.groupsApi?.invalidateBalances(dto.group_id);
    }
  }
}
