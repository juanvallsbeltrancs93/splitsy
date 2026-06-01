import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParticipantItem } from '@/presentation/components/shared/ParticipantItem';

describe('ParticipantItem', () => {
  it('renders name without disabled class when isDisabled is not set', () => {
    render(<ParticipantItem name="Alice" firstLetter="A" />);
    const item = screen.getByText('Alice').closest('.participant-item');
    expect(item).not.toHaveClass('participant-item--disabled');
  });

  it('renders with participant-item--disabled class when isDisabled is true', () => {
    render(<ParticipantItem name="Bob" firstLetter="B" isDisabled={true} />);
    const item = screen.getByText('Bob').closest('.participant-item');
    expect(item).toHaveClass('participant-item--disabled');
  });

  it('does not add disabled class when isDisabled is false', () => {
    render(<ParticipantItem name="Charlie" firstLetter="C" isDisabled={false} />);
    const item = screen.getByText('Charlie').closest('.participant-item');
    expect(item).not.toHaveClass('participant-item--disabled');
  });
});
