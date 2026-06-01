import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../utils/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../../utils/hooks/useAuth';
import { useJoinGroupActions } from './useJoinGroupActions';
import { ConflictError } from '@/domain/shared/errors';

const mockNavigate = vi.fn();
const mockedUseAuth = vi.mocked(useAuth);

describe('useJoinGroupActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call claim use case and navigate on success', async () => {
    const claimMock = vi.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({
      compositionRoot: {
        useCases: {
          groups: {
            claimParticipant: {
              execute: claimMock,
            },
          },
        },
      },
    } as any);

    const { result } = renderHook(() => useJoinGroupActions('group-123'));

    await result.current.handleClaim('alias-1');

    expect(claimMock).toHaveBeenCalledWith({ groupId: 'group-123', participantId: 'alias-1' });
    expect(mockNavigate).toHaveBeenCalledWith('/groups/group-123');
    expect(result.current.claimError).toBeNull();
  });

  it('should set claimError on ConflictError without navigating', async () => {
    const claimMock = vi.fn().mockRejectedValue(new ConflictError('Spot already taken'));
    mockedUseAuth.mockReturnValue({
      compositionRoot: {
        useCases: {
          groups: {
            claimParticipant: {
              execute: claimMock,
            },
          },
        },
      },
    } as any);

    const { result } = renderHook(() => useJoinGroupActions('group-123'));

    await result.current.handleClaim('alias-1');

    await waitFor(() => {
      expect(result.current.claimError).toBe('Spot already taken');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should set generic claimError on unknown error', async () => {
    const claimMock = vi.fn().mockRejectedValue(new Error('Network failure'));
    mockedUseAuth.mockReturnValue({
      compositionRoot: {
        useCases: {
          groups: {
            claimParticipant: {
              execute: claimMock,
            },
          },
        },
      },
    } as any);

    const { result } = renderHook(() => useJoinGroupActions('group-123'));

    await result.current.handleClaim('alias-1');

    await waitFor(() => {
      expect(result.current.claimError).toBe('Failed to claim spot. Please try again.');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should toggle isClaiming during claim', async () => {
    let resolveClaim: () => void;
    const claimMock = vi.fn().mockImplementation(() => new Promise<void>((resolve) => {
      resolveClaim = resolve;
    }));
    mockedUseAuth.mockReturnValue({
      compositionRoot: {
        useCases: {
          groups: {
            claimParticipant: {
              execute: claimMock,
            },
          },
        },
      },
    } as any);

    const { result } = renderHook(() => useJoinGroupActions('group-123'));

    // Start the claim but don't let it resolve yet
    const claimPromise = result.current.handleClaim('alias-1');

    // Wait for React to flush the synchronous setIsClaiming(true)
    await waitFor(() => {
      expect(result.current.isClaiming).toBe(true);
    });

    resolveClaim!();
    await claimPromise;

    await waitFor(() => {
      expect(result.current.isClaiming).toBe(false);
    });
  });
});
