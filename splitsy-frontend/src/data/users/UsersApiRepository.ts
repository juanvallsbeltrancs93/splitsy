import type { UserRepository } from '../../domain/users/repository/UserRepository';
import type { GetMeParams } from '../../domain/users/repository/types';
import { User } from '../../domain/users/entities/User';
import type { UsersApi } from '../apis/users/usersApi';
import { translateApiError } from '../shared/translateApiError';

export class UsersApiRepository implements UserRepository {
  constructor(private readonly api: UsersApi) {}

  async getMe(_params: GetMeParams): Promise<User> {
    try {
      const dto = await this.api.getMe();
      return User.create({
        id: dto.id,
        name: dto.name,
        email: dto.email,
      });
    } catch (error) {
      translateApiError(error, 'User');
    }
  }
}
