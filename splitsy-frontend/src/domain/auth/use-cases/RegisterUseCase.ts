import type { AuthRepository } from '../repository/AuthRepository';
import type { User } from '../../users/entities/User';
import type { RegisterParams } from '../repository/types';

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(props: RegisterParams): Promise<User> {
    try {
      return await this.authRepository.register(props);
    } catch (error) {
      throw new Error(`Error registering user: ${error}`);
    }
  }
}
