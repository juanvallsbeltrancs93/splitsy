import { User } from '@domain/users/entities/User';
import type { UserProps } from '@domain/users/entities/User';

export const userPropsMock: UserProps = {
  id: '1',
  name: 'Test User',
  email: 'test@test.com',
  password: 'TestPass1!',
};

export const userMock = User.create(userPropsMock);

describe('Tests on User entity', () => {
  it('should create a User with id, name, email, password', () => {
    const user = User.create(userPropsMock);
    expect(user.id.value).toBe('1');
    expect(user.name).toBe('Test User');
    expect(user.email.value).toBe('test@test.com');
    expect(user.password.value).toBe('TestPass1!');
  });

  it('should create a User without id (generates one)', () => {
    const user = User.create({ name: 'No Id', email: 'no@id.com', password: 'NoIdPass1!' });
    expect(user.id.value).toBeDefined();
    expect(user.id.value.length).toBeGreaterThan(0);
  });
});
