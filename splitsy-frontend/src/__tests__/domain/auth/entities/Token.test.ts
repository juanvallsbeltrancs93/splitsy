import { Token } from '@domain/auth/entities/Token';
import type { TokenProps } from '@domain/auth/entities/Token';

export const tokenPropsMock: TokenProps = {
  accessToken: 'fake-access-token-123',
  refreshToken: 'fake-refresh-token-456',
  tokenType: 'bearer',
};

export const tokenMock = Token.create(tokenPropsMock);

describe('Tests on Token entity', () => {
  it('should create a Token with accessToken, refreshToken and tokenType', () => {
    const token = Token.create(tokenPropsMock);
    expect(token.accessToken).toBe(tokenPropsMock.accessToken);
    expect(token.refreshToken).toBe(tokenPropsMock.refreshToken);
    expect(token.tokenType).toBe(tokenPropsMock.tokenType);
  });
});
