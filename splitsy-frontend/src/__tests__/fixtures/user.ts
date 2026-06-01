import { User } from '@/domain/users/entities/User';
import type { UserProps } from '@/domain/users/entities/User';

export function provideUserFixture(data: Partial<UserProps> = {}): User {
  return User.create({
    id: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
    ...data,
  });
}

export function provideTestUser(): User {
  return provideUserFixture({ id: 'user-1', name: 'Test User', email: 'test@example.com' });
}

export function provideAlice(): User {
  return provideUserFixture({ id: 'user-alice', name: 'Alice', email: 'alice@example.com' });
}

export function provideBob(): User {
  return provideUserFixture({ id: 'user-bob', name: 'Bob', email: 'bob@example.com' });
}
