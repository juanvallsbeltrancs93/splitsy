import type { AxiosInstance } from 'axios';
import type { UserResponseDto } from './types';

export class UsersApi {
  private userCache: UserResponseDto | null = null;

  constructor(private readonly http: AxiosInstance) {}

  async getMe(): Promise<UserResponseDto> {
    if (this.userCache) {
      return this.userCache!;
    }
    const response = await this.http.get('/users/me');
    this.userCache = response.data;
    return this.userCache!;
  }
}
