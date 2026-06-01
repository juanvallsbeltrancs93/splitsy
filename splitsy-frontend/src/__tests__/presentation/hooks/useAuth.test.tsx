import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock React's useContext to simulate "no context provided" 
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useContext: vi.fn(),
  };
});

import { useContext } from 'react';
import { useAuth } from '../../../presentation/utils/hooks/useAuth';

const mockUseContext = vi.mocked(useContext);

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws a descriptive error when called outside of AuthProvider', () => {
    mockUseContext.mockReturnValue(null);

    expect(() => useAuth()).toThrow('useAuth must be used within an AuthProvider');
  });

  it('returns the context value when AuthProvider is present', () => {
    const stubValue = { token: 'abc', isAuthenticated: true };
    mockUseContext.mockReturnValue(stubValue);

    const result = useAuth();

    expect(result.token).toBe('abc');
    expect(result.isAuthenticated).toBe(true);
  });
});
