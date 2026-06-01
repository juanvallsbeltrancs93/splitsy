import { createContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getCompositionRoot, clearCompositionRoot } from '../../CompositionRoot';
import type { CompositionRoot } from '../../CompositionRoot';
import type { User } from '../../domain/users/entities/User';

const ACCESS_TOKEN_KEY = 'splitsy_access_token';
const REFRESH_TOKEN_KEY = 'splitsy_refresh_token';

export interface AuthContextValue {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  compositionRoot: CompositionRoot | null;
  publicCompositionRoot: CompositionRoot;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(ACCESS_TOKEN_KEY),
  );
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(() => !!localStorage.getItem(ACCESS_TOKEN_KEY));

  const publicCompositionRoot = useMemo(() => getCompositionRoot(), []);

  const compositionRoot = useMemo(
    () => (token ? getCompositionRoot() : null),
    [token],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    clearCompositionRoot();
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await publicCompositionRoot.useCases.auth.login.execute({
      body: { username, password },
    });

    const newToken = result.accessToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    setToken(newToken);

    const authedRoot = getCompositionRoot();
    const me = await authedRoot.useCases.users.getMe.execute({});
    setUser(me);
  }, [publicCompositionRoot]);

  // ONE acceptable useEffect: validate existing token on mount
  useEffect(() => {
    if (!token) return;

    const authedRoot = getCompositionRoot();
    authedRoot.useCases.users.getMe
      .execute({})
      .then(setUser)
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      isInitializing,
      compositionRoot,
      publicCompositionRoot,
      login,
      logout,
    }),
    [token, user, isInitializing, compositionRoot, publicCompositionRoot, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
