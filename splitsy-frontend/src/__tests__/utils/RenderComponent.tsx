import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AuthContext } from '@/presentation/providers/AuthProvider';
import type { AuthContextValue } from '@/presentation/providers/AuthProvider';
import { User } from '@/domain/users/entities/User';
import type { CompositionRoot } from '@/CompositionRoot';

let _currentLoaderData: unknown = null;

export function setMockLoaderData(data: unknown) {
  _currentLoaderData = data;
}

export function getMockLoaderData(): unknown {
  return _currentLoaderData;
}

export function clearMockLoaderData() {
  _currentLoaderData = null;
}

export const defaultTestAuthContextValue: AuthContextValue = {
  token: 'test-token',
  user: User.create({ id: 'user-1', name: 'Test User', email: 'test@example.com' }),
  isAuthenticated: true,
  isInitializing: false,
  compositionRoot: null,
  publicCompositionRoot: {} as AuthContextValue['publicCompositionRoot'],
  login: async () => {},
  logout: () => {},
};

export interface RenderComponentOptions {
  compositionRoot?: CompositionRoot;
  loaderData?: unknown;
  authContext?: Partial<AuthContextValue>;
}

export function TestWrapper({
  children,
  authContext = {},
  compositionRoot,
}: {
  children: ReactElement;
  authContext?: Partial<AuthContextValue>;
  compositionRoot?: CompositionRoot;
}) {
  const mergedContext: AuthContextValue = {
    ...defaultTestAuthContextValue,
    ...authContext,
    ...(compositionRoot ? { compositionRoot, publicCompositionRoot: compositionRoot } : {}),
  };

  return (
    <AuthContext.Provider value={mergedContext}>
      <BrowserRouter>{children}</BrowserRouter>
    </AuthContext.Provider>
  );
}

export function RenderComponent(
  ui: ReactElement,
  options: RenderComponentOptions = {}
) {
  if (options.loaderData !== undefined) {
    setMockLoaderData(options.loaderData);
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <TestWrapper
        authContext={options.authContext}
        compositionRoot={options.compositionRoot}
      >
        {children as ReactElement}
      </TestWrapper>
    ),
  });
}
