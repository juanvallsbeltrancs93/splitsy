import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditGroupDialog } from '@/presentation/components/groups/EditGroupDialog/useEditGroupDialog';
import { provideGroupWithParticipants, provideParticipant } from '@/__tests__/fixtures/group';

const mockAddParticipantExecute = vi.fn();
const mockRemoveParticipantExecute = vi.fn();
const mockUpdateExecute = vi.fn();
const mockGetExecute = vi.fn();

vi.mock('@/presentation/utils/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: { value: 'user-1' } },
    compositionRoot: {
      useCases: {
        groups: {
          removeParticipant: { execute: mockRemoveParticipantExecute },
          addParticipant: { execute: mockAddParticipantExecute },
          update: { execute: mockUpdateExecute },
          get: { execute: mockGetExecute },
        },
      },
    },
  }),
}));

describe('useEditGroupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildProps(overrides: Partial<Parameters<typeof useEditGroupDialog>[0]> = {}) {
    const group = provideGroupWithParticipants();
    return {
      group,
      onSuccess: vi.fn(),
      onClose: vi.fn(),
      ...overrides,
    };
  }

  it('should have participantToRemove as null initially', () => {
    const props = buildProps();
    const { result } = renderHook(() => useEditGroupDialog(props));

    expect(result.current.participantToRemove).toBeNull();
  });

  it('should set participantToRemove on onRemoveParticipant', () => {
    const props = buildProps();
    const { result } = renderHook(() => useEditGroupDialog(props));

    act(() => {
      result.current.onRemoveParticipant('p2');
    });

    expect(result.current.participantToRemove).not.toBeNull();
    expect(result.current.participantToRemove?.id).toBe('p2');
    expect(result.current.participantToRemove?.displayName).toBe('Bob');
  });

  it('should not set participantToRemove if participant not found', () => {
    const props = buildProps();
    const { result } = renderHook(() => useEditGroupDialog(props));

    act(() => {
      result.current.onRemoveParticipant('nonexistent');
    });

    expect(result.current.participantToRemove).toBeNull();
  });

  it('should call onSuccess and clear participantToRemove on onRemoveParticipantSuccess', () => {
    const onSuccess = vi.fn();
    const props = buildProps({ onSuccess });
    const { result } = renderHook(() => useEditGroupDialog(props));

    act(() => {
      result.current.onRemoveParticipant('p2');
    });

    const updatedGroup = provideGroupWithParticipants({ id: 'group-1', participants: [provideParticipant({ id: 'p1', displayName: 'Alice' })] });

    act(() => {
      result.current.onRemoveParticipantSuccess(updatedGroup);
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedGroup);
    expect(result.current.participantToRemove).toBeNull();
  });

  it('should clear participantToRemove on onCancelRemove', () => {
    const props = buildProps();
    const { result } = renderHook(() => useEditGroupDialog(props));

    act(() => {
      result.current.onRemoveParticipant('p2');
    });

    expect(result.current.participantToRemove).not.toBeNull();

    act(() => {
      result.current.onCancelRemove();
    });

    expect(result.current.participantToRemove).toBeNull();
  });

  it('should return currentUserId from useAuth', () => {
    const props = buildProps();
    const { result } = renderHook(() => useEditGroupDialog(props));

    expect(result.current.currentUserId).toBe('user-1');
  });

  describe('canRemoveParticipant', () => {
    // currentUserId = 'user-1', which maps to participant p1 (userId: 'user-1')
    // Owner group: ownerId = 'p1'
    function buildOwnerProps() {
      const group = provideGroupWithParticipants({ ownerId: 'p1' });
      return { group, onSuccess: vi.fn(), onClose: vi.fn() };
    }

    // Non-owner group: ownerId = 'p2' (someone else)
    function buildNonOwnerProps() {
      const group = provideGroupWithParticipants({ ownerId: 'p2' });
      return { group, onSuccess: vi.fn(), onClose: vi.fn() };
    }

    it('owner can remove other participants', () => {
      const { result } = renderHook(() => useEditGroupDialog(buildOwnerProps()));
      expect(result.current.canRemoveParticipant('p2')).toBe(true);
    });

    it('owner cannot remove themselves', () => {
      const { result } = renderHook(() => useEditGroupDialog(buildOwnerProps()));
      expect(result.current.canRemoveParticipant('p1')).toBe(false);
    });

    it('non-owner can remove themselves', () => {
      const { result } = renderHook(() => useEditGroupDialog(buildNonOwnerProps()));
      expect(result.current.canRemoveParticipant('p1')).toBe(true);
    });

    it('non-owner cannot remove others', () => {
      const { result } = renderHook(() => useEditGroupDialog(buildNonOwnerProps()));
      expect(result.current.canRemoveParticipant('p2')).toBe(false);
    });
  });

  describe('alias validation', () => {
    it('should have newAliasError as null initially', () => {
      const props = buildProps();
      const { result } = renderHook(() => useEditGroupDialog(props));

      expect(result.current.newAliasError).toBeNull();
    });

    it('should block adding alias that matches an active participant (case-insensitive, trimmed)', async () => {
      const group = provideGroupWithParticipants();
      // Alice and Bob are active by default in provideGroupWithParticipants
      const props = buildProps({ group });
      const { result } = renderHook(() => useEditGroupDialog(props));

      act(() => { result.current.onNewAliasNameChange(' aLiCe '); });
      await act(async () => { await result.current.onAddAlias(); });

      expect(result.current.newAliasError).not.toBeNull();
      expect(mockAddParticipantExecute).not.toHaveBeenCalled();
    });

    it('should allow adding alias that matches only an inactive participant', async () => {
      mockAddParticipantExecute.mockResolvedValue(provideGroupWithParticipants());

      const group = provideGroupWithParticipants({
        participants: [
          provideParticipant({ id: 'p1', displayName: 'Alice', isActive: true }),
          provideParticipant({ id: 'p2', displayName: 'Bob', isActive: false }),
        ],
      });
      const props = buildProps({ group });
      const { result } = renderHook(() => useEditGroupDialog(props));

      act(() => { result.current.onNewAliasNameChange('Bob'); });
      await act(async () => { await result.current.onAddAlias(); });

      expect(result.current.newAliasError).toBeNull();
      expect(mockAddParticipantExecute).toHaveBeenCalled();
    });

    it('should call API and call onSuccess when adding a brand new name', async () => {
      const updatedGroup = provideGroupWithParticipants({
        participants: [
          provideParticipant({ id: 'p1', displayName: 'Alice', isActive: true }),
          provideParticipant({ id: 'p2', displayName: 'Bob', isActive: true }),
          provideParticipant({ id: 'p3', displayName: 'Charlie', isActive: true }),
          provideParticipant({ id: 'p4', displayName: 'Dave', isActive: true }),
        ],
      });
      mockAddParticipantExecute.mockResolvedValue(updatedGroup);

      const onSuccess = vi.fn();
      const props = buildProps({ onSuccess });
      const { result } = renderHook(() => useEditGroupDialog(props));

      act(() => { result.current.onNewAliasNameChange('Dave'); });
      await act(async () => { await result.current.onAddAlias(); });

      expect(result.current.newAliasError).toBeNull();
      expect(mockAddParticipantExecute).toHaveBeenCalledWith({
        groupId: 'group-1',
        body: { type: 'NON_REGISTERED', display_name: 'Dave' },
      });
      expect(result.current.newAliasName).toBe('');
      expect(onSuccess).toHaveBeenCalledWith(updatedGroup);
    });

    it('should call onSuccess with updated group after adding alias so new participant appears immediately', async () => {
      const updatedGroup = provideGroupWithParticipants({
        participants: [
          provideParticipant({ id: 'p1', displayName: 'Alice', isActive: true }),
          provideParticipant({ id: 'p2', displayName: 'Bob', isActive: true }),
          provideParticipant({ id: 'p3', displayName: 'Charlie', isActive: true }),
          provideParticipant({ id: 'p4', displayName: 'NewPerson', isActive: true }),
        ],
      });
      mockAddParticipantExecute.mockResolvedValue(updatedGroup);

      const onSuccess = vi.fn();
      const props = buildProps({ onSuccess });
      const { result } = renderHook(() => useEditGroupDialog(props));

      act(() => { result.current.onNewAliasNameChange('NewPerson'); });
      await act(async () => { await result.current.onAddAlias(); });

      expect(onSuccess).toHaveBeenCalledWith(updatedGroup);
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should clear newAliasError when input changes', async () => {
      const props = buildProps();
      const { result } = renderHook(() => useEditGroupDialog(props));

      // Trigger error by attempting to add active participant name
      act(() => { result.current.onNewAliasNameChange('Alice'); });
      await act(async () => { await result.current.onAddAlias(); });
      expect(result.current.newAliasError).not.toBeNull();

      // Change input — error should clear
      act(() => { result.current.onNewAliasNameChange('Alice2'); });
      expect(result.current.newAliasError).toBeNull();
    });
  });
});
