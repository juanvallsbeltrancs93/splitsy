import { mockAuthRepository } from '@tests/fakeRepositories';
import { tokenMock } from '../entities/Token.test';
import { userMock } from '../../users/entities/User.test';
import type { LoginParams, RegisterParams } from '@domain/auth/repository/types';

export const loginParams: LoginParams = {
  body: { username: 'test@test.com', password: 'pass123' },
};

export const registerParams: RegisterParams = {
  body: { name: 'Test User', email: 'test@test.com', password: 'pass123' },
};

export function provideHappyAuthRepository() {
  vi.mocked(mockAuthRepository.login).mockResolvedValue(tokenMock);
  vi.mocked(mockAuthRepository.register).mockResolvedValue(userMock);
  return mockAuthRepository;
}

export function provideErrorAuthRepository() {
  vi.mocked(mockAuthRepository.login).mockRejectedValue(new Error('login failed'));
  vi.mocked(mockAuthRepository.register).mockRejectedValue(new Error('register failed'));
  return mockAuthRepository;
}
