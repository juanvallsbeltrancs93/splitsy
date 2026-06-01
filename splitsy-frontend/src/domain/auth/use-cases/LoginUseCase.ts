import type { AuthRepository } from '../repository/AuthRepository';
import type { Token } from '../entities/Token';
import type { LoginParams } from '../repository/types';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(props: LoginParams): Promise<Token> {
    try {
      return await this.authRepository.login(props);
    } catch (error) {
      throw new Error(`Error logging in: ${error}`);
    }
  }
}
