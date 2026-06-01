import type { AxiosInstance } from 'axios';
import type {
  LoginRequestDto,
  TokenResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from './types';

export class AuthApi {
  constructor(private readonly http: AxiosInstance) {}

  async login(data: LoginRequestDto): Promise<TokenResponseDto> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);

    const response = await this.http.post('/auth/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    const response = await this.http.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async register(data: RegisterRequestDto): Promise<RegisterResponseDto> {
    const response = await this.http.post('/auth/register', data);
    return response.data;
  }
}
