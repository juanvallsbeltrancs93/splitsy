import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RemoveParticipantDialog } from '@/presentation/components/groups/RemoveParticipantDialog/RemoveParticipantDialog';
import { RenderComponent } from '@/__tests__/utils/RenderComponent';
import { Participant } from '@/domain/group/entities/Participant';

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

describe('RemoveParticipantDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderDialog(props: Partial<Parameters<typeof RemoveParticipantDialog>[0]> = {}) {
    const defaultProps = {
      open: true,
      participant: Participant.create({ id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' }),
      groupId: 'group-1',
      currentUserId: 'user-1',
      onSuccess: vi.fn(),
      onClose: vi.fn(),
    };
    return RenderComponent(<RemoveParticipantDialog {...defaultProps} {...props} />);
  }

  it('should render self-removal warning when isSelf is true', () => {
    renderDialog({ currentUserId: 'user-1', participant: Participant.create({ id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' }) });

    expect(screen.getByText('Remove participant')).toBeInTheDocument();
    expect(screen.getByText(/You are about to remove yourself from this group/)).toBeInTheDocument();
  });

  it('should render standard confirmation when isSelf is false', () => {
    renderDialog({ currentUserId: 'user-2', participant: Participant.create({ id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' }) });

    expect(screen.getByText('Remove participant')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to remove Alice from this group?/)).toBeInTheDocument();
  });

  it('should call onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderDialog({ onClose });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onConfirm when Remove is clicked', async () => {
    mockRemoveParticipantExecute.mockResolvedValue({
      id: 'group-1',
      name: 'Test Group',
      currency: 'USD',
      participants: [],
    });
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    renderDialog({ onSuccess, currentUserId: 'user-2' });

    const removeButton = screen.getByRole('button', { name: 'Remove' });
    await user.click(removeButton);

    expect(mockRemoveParticipantExecute).toHaveBeenCalledWith({ groupId: 'group-1', participantId: 'p1' });
  });

  it('should display error alert when submitError is set', async () => {
    mockRemoveParticipantExecute.mockRejectedValue(new Error('Server error'));
    const user = userEvent.setup();
    renderDialog();

    const removeButton = screen.getByRole('button', { name: 'Remove' });
    await user.click(removeButton);

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to remove participant. Please try again.');
  });
});
