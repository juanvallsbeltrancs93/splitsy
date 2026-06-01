import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../utils/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useLoaderData } from 'react-router-dom';
import { useAuth } from '../../../utils/hooks/useAuth';
import { useJoinGroupState } from './useJoinGroupState';
import { User } from '@/domain/users/entities/User';
import { provideGroupWithParticipants } from '@/__tests__/fixtures/group';

const mockNavigate = vi.fn();
const mockedUseLoaderData = vi.mocked(useLoaderData);
const mockedUseAuth = vi.mocked(useAuth);

describe('useJoinGroupState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should derive availableAliases from group participants', () => {
    const group = provideGroupWithParticipants({
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' },
        { id: 'p2', displayName: 'Bob', type: 'NON_REGISTERED' },
        { id: 'p3', displayName: 'Charlie', type: 'NON_REGISTERED' },
      ],
    });
    mockedUseLoaderData.mockReturnValue({ group });
    mockedUseAuth.mockReturnValue({
      user: User.create({ id: 'user-2', name: 'Test User', email: 'test@example.com' }),
      isAuthenticated: true,
      isInitializing: false,
    } as any);

    const { result } = renderHook(() => useJoinGroupState('group-123'));

    expect(result.current.availableAliases).toHaveLength(2);
    expect(result.current.availableAliases[0].displayName).toBe('Bob');
    expect(result.current.availableAliases[1].displayName).toBe('Charlie');
  });

  it('should detect when user is already a participant', () => {
    const group = provideGroupWithParticipants({
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' },
        { id: 'p2', displayName: 'Bob', type: 'NON_REGISTERED' },
      ],
    });
    mockedUseLoaderData.mockReturnValue({ group });
    mockedUseAuth.mockReturnValue({
      user: User.create({ id: 'user-1', name: 'Alice', email: 'alice@example.com' }),
      isAuthenticated: true,
      isInitializing: false,
    } as any);

    renderHook(() => useJoinGroupState('group-123'));

    expect(mockNavigate).toHaveBeenCalledWith('/groups/group-123');
  });

  it('should redirect to login when not authenticated and not initializing', () => {
    const group = provideGroupWithParticipants();
    mockedUseLoaderData.mockReturnValue({ group });
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    } as any);

    renderHook(() => useJoinGroupState('group-123'));

    expect(mockNavigate).toHaveBeenCalledWith('/login?redirect=/join/group-123');
  });

  it('should return empty aliases when all participants are registered', () => {
    const group = provideGroupWithParticipants({
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' },
        { id: 'p2', displayName: 'Bob', type: 'REGISTERED', userId: 'user-2' },
      ],
    });
    mockedUseLoaderData.mockReturnValue({ group });
    mockedUseAuth.mockReturnValue({
      user: User.create({ id: 'user-3', name: 'Test User', email: 'test@example.com' }),
      isAuthenticated: true,
      isInitializing: false,
    } as any);

    const { result } = renderHook(() => useJoinGroupState('group-123'));

    expect(result.current.availableAliases).toHaveLength(0);
    expect(result.current.isAlreadyParticipant).toBe(false);
  });

  it('should handle loading state when auth is initializing', () => {
    const group = provideGroupWithParticipants();
    mockedUseLoaderData.mockReturnValue({ group });
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
    } as any);

    const { result } = renderHook(() => useJoinGroupState('group-123'));

    expect(result.current.isLoading).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
