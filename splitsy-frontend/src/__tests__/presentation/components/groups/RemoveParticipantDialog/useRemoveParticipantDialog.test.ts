import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRemoveParticipantDialog } from '@/presentation/components/groups/RemoveParticipantDialog/useRemoveParticipantDialog';
import type { RemoveParticipantDialogProps } from '@/presentation/components/groups/RemoveParticipantDialog/types';
import { Participant } from '@/domain/group/entities/Participant';
import { Group } from '@/domain/group/entities/Group';

const mockNavigate = vi.fn();
const mockRemoveParticipantExecute = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/presentation/utils/hooks/useAuth', () => ({
  useAuth: () => ({
    compositionRoot: {
      useCases: {
        groups: {
          removeParticipant: {
            execute: mockRemoveParticipantExecute,
          },
        },
      },
    },
  }),
}));

function buildProps(overrides: Partial<RemoveParticipantDialogProps> = {}): RemoveParticipantDialogProps {
  return {
    open: true,
    participant: Participant.create({ id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' }),
    groupId: 'group-1',
    currentUserId: 'user-1',
    onSuccess: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
}

function buildUpdatedGroup(): Group {
  return Group.create({
    id: 'group-1',
    name: 'Test Group',
    currency: 'USD',
    participants: [Participant.create({ id: 'p2', displayName: 'Bob', type: 'REGISTERED', userId: 'user-2' })],
  });
}

describe('useRemoveParticipantDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set isSelf to true when participant.userId equals currentUserId', () => {
    const props = buildProps({ currentUserId: 'user-1', participant: Participant.create({ id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' }) });
    const { result } = renderHook(() => useRemoveParticipantDialog(props));

    expect(result.current.isSelf).toBe(true);
  });

  it('should set isSelf to false when userId differs from currentUserId', () => {
    const props = buildProps({ currentUserId: 'user-2', participant: Participant.create({ id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' }) });
    const { result } = renderHook(() => useRemoveParticipantDialog(props));

    expect(result.current.isSelf).toBe(false);
  });

  it('should set isSelf to false when participant.userId is undefined', () => {
    const props = buildProps({ currentUserId: 'user-1', participant: Participant.create({ id: 'p3', displayName: 'Charlie', type: 'NON_REGISTERED' }) });
    const { result } = renderHook(() => useRemoveParticipantDialog(props));

    expect(result.current.isSelf).toBe(false);
  });

  it('should call removeParticipant use case with correct params on confirm', async () => {
    const updatedGroup = buildUpdatedGroup();
    mockRemoveParticipantExecute.mockResolvedValue(updatedGroup);
    const props = buildProps();

    const { result } = renderHook(() => useRemoveParticipantDialog(props));

    await act(async () => {
      await result.current.onConfirm();
    });

    expect(mockRemoveParticipantExecute).toHaveBeenCalledWith({ groupId: 'group-1', participantId: 'p1' });
  });

  it('should call onSuccess with updated group on success', async () => {
    const updatedGroup = buildUpdatedGroup();
    mockRemoveParticipantExecute.mockResolvedValue(updatedGroup);
    const onSuccess = vi.fn();
    const props = buildProps({ onSuccess });

    const { result } = renderHook(() => useRemoveParticipantDialog(props));

    await act(async () => {
      await result.current.onConfirm();
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedGroup);
  });

  it('should call onClose on success when removing another participant', async () => {
    const updatedGroup = buildUpdatedGroup();
    mockRemoveParticipantExecute.mockResolvedValue(updatedGroup);
    const onClose = vi.fn();
    const props = buildProps({ onClose, currentUserId: 'user-2' });

    const { result } = renderHook(() => useRemoveParticipantDialog(props));

    await act(async () => {
      await result.current.onConfirm();
    });

    expect(onClose).toHaveBeenCalled();
  });

  it('should navigate to / on success when removing self', async () => {
    const updatedGroup = buildUpdatedGroup();
    mockRemoveParticipantExecute.mockResolvedValue(updatedGroup);
    const props = buildProps({ currentUserId: 'user-1' });

    const { result } = renderHook(() => useRemoveParticipantDialog(props));

    await act(async () => {
      await result.current.onConfirm();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should set submitError on error and not call onSuccess or navigate', async () => {
    mockRemoveParticipantExecute.mockRejectedValue(new Error('Server error'));
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const props = buildProps({ onSuccess, onClose });

    const { result } = renderHook(() => useRemoveParticipantDialog(props));

    await act(async () => {
      await result.current.onConfirm();
    });

    expect(result.current.submitError).toBe('Failed to remove participant. Please try again.');
    expect(onSuccess).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
