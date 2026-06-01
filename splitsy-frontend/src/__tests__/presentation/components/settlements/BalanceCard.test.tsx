import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceCard } from '@/presentation/components/settlements/BalanceCard/BalanceCard';
import { provideParticipant } from '@/__tests__/fixtures/group';

describe('BalanceCard', () => {
  it('renders inactive participant balance row with participant-item--disabled class', () => {
    const participants = [
      provideParticipant({ id: 'p1', displayName: 'Inactive Bob', isActive: false }),
    ];

    render(<BalanceCard participantId="p1" balance={-20} participants={participants} currencyCode="USD" />);

    const nameEl = screen.getByText('Inactive Bob');
    const item = nameEl.closest('.participant-item');
    expect(item).toHaveClass('participant-item--disabled');
  });

  it('renders active participant balance row without participant-item--disabled class', () => {
    const participants = [
      provideParticipant({ id: 'p2', displayName: 'Alice', isActive: true }),
    ];

    render(<BalanceCard participantId="p2" balance={50} participants={participants} currencyCode="USD" />);

    const nameEl = screen.getByText('Alice');
    const item = nameEl.closest('.participant-item');
    expect(item).not.toHaveClass('participant-item--disabled');
  });
});
