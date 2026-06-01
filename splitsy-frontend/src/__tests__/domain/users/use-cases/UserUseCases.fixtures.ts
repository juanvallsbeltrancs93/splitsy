import { mockUserRepository } from '@tests/fakeRepositories';
import { userMock } from '../entities/User.test';
import type { GetMeParams } from '@domain/users/repository/types';

export const getMeParams: GetMeParams = {};

export function provideHappyUserRepository() {
  vi.mocked(mockUserRepository.getMe).mockResolvedValue(userMock);
  return mockUserRepository;
}

export function provideErrorUserRepository() {
  vi.mocked(mockUserRepository.getMe).mockRejectedValue(new Error('user failed'));
  return mockUserRepository;
}
