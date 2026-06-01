import type { UserRepository } from '../repository/UserRepository';
import type { User } from '../entities/User';
import type { GetMeParams } from '../repository/types';

export class GetMeUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(props: GetMeParams): Promise<User> {
    try {
      return await this.userRepository.getMe(props);
    } catch (error) {
      throw new Error(`Error getting current user: ${error}`);
    }
  }
}
