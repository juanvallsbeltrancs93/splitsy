import { UsersApi } from '@data/apis/users/usersApi';
import { UsersApiRepository } from '@data/users/UsersApiRepository';
import { User } from '@domain/users/entities/User';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';
import {
  givenGetMeSuccess,
  givenGetMeError,
} from './HttpUserRepository.fixtures';

const mockWebServer = new MockWebServer();

function createRepo() {
  return new UsersApiRepository(new UsersApi(provideApi()));
}

describe('Tests on UsersApiRepository', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should return a User instance on getMe', async () => {
    givenGetMeSuccess(mockWebServer);
    const result = await createRepo().getMe({});
    expect(result).toBeInstanceOf(User);
  });

  it('should return User with correct email on getMe', async () => {
    givenGetMeSuccess(mockWebServer);
    const result = await createRepo().getMe({});
    expect(result.email.value).toBe('test@test.com');
  });

  it('should throw on getMe with 401', async () => {
    givenGetMeError(mockWebServer);
    await expect(createRepo().getMe({})).rejects.toThrow();
  });
});
