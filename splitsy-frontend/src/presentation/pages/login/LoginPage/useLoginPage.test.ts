import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: vi.fn(),
  };
});

// Mock useAuth
vi.mock('../../../utils/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    isAuthenticated: false,
  }),
}));

import { useSearchParams } from 'react-router-dom';
import { useLoginPage } from './useLoginPage';

const mockedUseSearchParams = vi.mocked(useSearchParams);

describe('useLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should navigate to redirect query param on successful login', async () => {
    const searchParams = new URLSearchParams('redirect=/join/group-123');
    mockedUseSearchParams.mockReturnValue([searchParams, vi.fn()]);

    const { result } = renderHook(() => useLoginPage());

    result.current.setUsername('testuser');
    result.current.setPassword('password');

    await result.current.handleSubmit();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/join/group-123');
    });
  });

  it('should navigate to root when no redirect query param is present', async () => {
    const searchParams = new URLSearchParams();
    mockedUseSearchParams.mockReturnValue([searchParams, vi.fn()]);

    const { result } = renderHook(() => useLoginPage());

    result.current.setUsername('testuser');
    result.current.setPassword('password');

    await result.current.handleSubmit();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should navigate to root when redirect query param is empty', async () => {
    const searchParams = new URLSearchParams('redirect=');
    mockedUseSearchParams.mockReturnValue([searchParams, vi.fn()]);

    const { result } = renderHook(() => useLoginPage());

    result.current.setUsername('testuser');
    result.current.setPassword('password');

    await result.current.handleSubmit();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
