import type { AuthRepository } from '../../domain/auth/repository/AuthRepository';
import type { LoginParams, RegisterParams } from '../../domain/auth/repository/types';
import { Token } from '../../domain/auth/entities/Token';
import { User } from '../../domain/users/entities/User';
import type { AuthApi } from '../apis/auth/authApi';
import { translateApiError } from '../shared/translateApiError';

export class AuthApiRepository implements AuthRepository {
  constructor(private readonly api: AuthApi) {}

  async login(params: LoginParams): Promise<Token> {
    try {
      const dto = await this.api.login({
        username: params.body.username,
        password: params.body.password,
      });
      return Token.create({
        accessToken: dto.access_token,
        refreshToken: dto.refresh_token,
        tokenType: dto.token_type,
      });
    } catch (error) {
      translateApiError(error, 'Auth');
    }
  }

  async register(params: RegisterParams): Promise<User> {
    try {
      const dto = await this.api.register({
        name: params.body.name,
        email: params.body.email,
        password: params.body.password,
      });
      return User.create({
        id: dto.id,
        name: dto.name,
        email: dto.email,
      });
    } catch (error) {
      translateApiError(error, 'Auth');
    }
  }
}
