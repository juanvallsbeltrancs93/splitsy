import { AuthApi } from '@data/apis/auth/authApi';
import { AuthApiRepository } from '@data/auth/AuthApiRepository';
import { Token } from '@domain/auth/entities/Token';
import { User } from '@domain/users/entities/User';
import { MockWebServer } from '@tests/MockWebServer';
import { provideApi } from '@tests/mocks/api';
import {
  givenLoginSuccess,
  givenLoginError,
  givenRegisterSuccess,
  givenRegisterError,
} from './HttpAuthRepository.fixtures';

const mockWebServer = new MockWebServer();

function createRepo() {
  return new AuthApiRepository(new AuthApi(provideApi()));
}

describe('Tests on AuthApiRepository', () => {
  beforeAll(() => mockWebServer.start());
  afterEach(() => mockWebServer.resetHandlers());
  afterAll(() => mockWebServer.close());

  it('should return a Token instance on login', async () => {
    givenLoginSuccess(mockWebServer);
    const result = await createRepo().login({ body: { username: 'test@test.com', password: 'pass123' } });
    expect(result).toBeInstanceOf(Token);
  });

  it('should return Token with correct accessToken and refreshToken on login', async () => {
    givenLoginSuccess(mockWebServer);
    const result = await createRepo().login({ body: { username: 'test@test.com', password: 'pass123' } });
    expect(result.accessToken).toBe('tok123');
    expect(result.refreshToken).toBe('refresh-abc');
    expect(result.tokenType).toBe('bearer');
  });

  it('should throw on login with 401', async () => {
    givenLoginError(mockWebServer);
    await expect(createRepo().login({ body: { username: 'bad@test.com', password: 'wrong' } })).rejects.toThrow();
  });

  it('should return a User instance on register', async () => {
    givenRegisterSuccess(mockWebServer);
    const result = await createRepo().register({ body: { name: 'Test User', email: 'test@test.com', password: 'pass123' } });
    expect(result).toBeInstanceOf(User);
  });

  it('should return User with correct name on register', async () => {
    givenRegisterSuccess(mockWebServer);
    const result = await createRepo().register({ body: { name: 'Test User', email: 'test@test.com', password: 'pass123' } });
    expect(result.name).toBe('Test User');
  });

  it('should throw on register with 400', async () => {
    givenRegisterError(mockWebServer);
    await expect(createRepo().register({ body: { name: 'Test', email: 'test@test.com', password: 'pass' } })).rejects.toThrow();
  });
});
