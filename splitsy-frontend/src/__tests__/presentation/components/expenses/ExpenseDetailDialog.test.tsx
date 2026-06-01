import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExpenseDetailDialog } from '@/presentation/components/expenses/ExpenseDetailDialog/ExpenseDetailDialog';
import { provideExpenseWithSplits, provideParticipant } from '@/__tests__/fixtures/group';

vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(() => false),
}));

describe('ExpenseDetailDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildProps() {
    const expense = provideExpenseWithSplits({
      paidBy: 'p1',
      splits: [
        { participantId: 'p1', amount: 40 },
        { participantId: 'p2', amount: 40 },
        { participantId: 'p3', amount: 40 },
      ],
    });

    const participants = [
      provideParticipant({ id: 'p1', displayName: 'Alice', isActive: true }),
      provideParticipant({ id: 'p2', displayName: 'Bob', isActive: true }),
      provideParticipant({ id: 'p3', displayName: 'Inactive Charlie', isActive: false }),
    ];

    return {
      open: true,
      expense,
      participants,
      currentUserId: 'user-1',
      currencyCode: 'USD',
      hasPrev: false,
      hasNext: false,
      onPrev: vi.fn(),
      onNext: vi.fn(),
      onClose: vi.fn(),
    };
  }

  it('renders inactive participant with participant-item--disabled class', () => {
    const props = buildProps();
    render(<ExpenseDetailDialog {...props} />);

    const charlieEl = screen.getByText('Inactive Charlie');
    const item = charlieEl.closest('.participant-item');
    expect(item).toHaveClass('participant-item--disabled');
  });

  it('renders active participant without participant-item--disabled class', () => {
    const props = buildProps();
    render(<ExpenseDetailDialog {...props} />);

    const bobEl = screen.getByText('Bob');
    const item = bobEl.closest('.participant-item');
    expect(item).not.toHaveClass('participant-item--disabled');
  });

  it('renders inactive payer with participant-item--disabled class', () => {
    const expense = provideExpenseWithSplits({
      paidBy: 'p1',
      splits: [
        { participantId: 'p1', amount: 40 },
        { participantId: 'p2', amount: 40 },
      ],
    });
    const participants = [
      provideParticipant({ id: 'p1', displayName: 'Inactive Alice', isActive: false }),
      provideParticipant({ id: 'p2', displayName: 'Bob', isActive: true }),
    ];
    render(
      <ExpenseDetailDialog
        open={true}
        expense={expense}
        participants={participants}
        currentUserId="user-1"
        currencyCode="USD"
        hasPrev={false}
        hasNext={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // The payer "Inactive Alice" should appear in the "From" section with disabled class
    const aliceEl = screen.getByText('Inactive Alice');
    const item = aliceEl.closest('.participant-item');
    expect(item).toHaveClass('participant-item--disabled');
  });

  it('renders active payer without participant-item--disabled class', () => {
    const props = buildProps();
    render(<ExpenseDetailDialog {...props} />);

    // Alice (p1) is the payer and is active
    const aliceEl = screen.getByText('Alice');
    const item = aliceEl.closest('.participant-item');
    expect(item).not.toHaveClass('participant-item--disabled');
  });
});
