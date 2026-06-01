import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EditGroupDialog } from '@/presentation/components/groups/EditGroupDialog/EditGroupDialog';
import { provideGroupWithParticipants } from '@/__tests__/fixtures/group';
import type { Participant } from '@/domain/group/entities/Participant';

const mockHookReturn = {
  name: 'Test Group',
  nameError: null,
  currency: 'USD',
  participants: [] as Participant[],
  newAliasName: '',
  newAliasError: null as string | null,
  isLoading: false,
  submitError: null,
  participantToRemove: null,
  currentUserId: 'user-1',
  canRemoveParticipant: vi.fn(() => true),
  onNameChange: vi.fn(),
  onNewAliasNameChange: vi.fn(),
  onRemoveParticipant: vi.fn(),
  onRemoveParticipantSuccess: vi.fn(),
  onCancelRemove: vi.fn(),
  onAddAlias: vi.fn(),
  onSubmit: vi.fn(),
};

vi.mock('@/presentation/components/groups/EditGroupDialog/useEditGroupDialog', () => ({
  useEditGroupDialog: () => mockHookReturn,
}));

vi.mock('@/presentation/components/groups/RemoveParticipantDialog', () => ({
  RemoveParticipantDialog: () => null,
}));

describe('EditGroupDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHookReturn.newAliasError = null;
  });

  it('shows no error on alias TextField when newAliasError is null', () => {
    const group = provideGroupWithParticipants();
    mockHookReturn.newAliasError = null;

    render(
      <EditGroupDialog
        open={true}
        group={group}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    const addAliasInput = screen.getByLabelText('Add alias participant');
    expect(addAliasInput).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('shows inline error on alias TextField when newAliasError is set', () => {
    const group = provideGroupWithParticipants();
    mockHookReturn.newAliasError = 'A participant named "Alice" already exists';

    render(
      <EditGroupDialog
        open={true}
        group={group}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('A participant named "Alice" already exists')).toBeInTheDocument();
  });

  describe('remove button disabled/enabled by canRemoveParticipant', () => {
    it('remove button is enabled when canRemoveParticipant returns true', () => {
      mockHookReturn.canRemoveParticipant = vi.fn(() => true);
      mockHookReturn.participants = provideGroupWithParticipants().activeParticipants;

      render(
        <EditGroupDialog open={true} group={provideGroupWithParticipants()} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const buttons = screen.getAllByRole('button', { name: /Remove/ });
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((btn) => expect(btn).not.toBeDisabled());
    });

    it('remove button is disabled when canRemoveParticipant returns false', () => {
      mockHookReturn.canRemoveParticipant = vi.fn(() => false);
      mockHookReturn.participants = provideGroupWithParticipants().activeParticipants;

      render(
        <EditGroupDialog open={true} group={provideGroupWithParticipants()} onClose={vi.fn()} onSuccess={vi.fn()} />
      );

      const buttons = screen.getAllByRole('button', { name: /Remove/ });
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((btn) => expect(btn).toBeDisabled());
    });
  });
});
