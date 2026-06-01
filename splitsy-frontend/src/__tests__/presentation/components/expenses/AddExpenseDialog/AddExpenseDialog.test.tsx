import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { AddExpenseDialog } from '@/presentation/components/expenses/AddExpenseDialog/AddExpenseDialog';
import { RenderComponent, defaultTestAuthContextValue } from '@/__tests__/utils/RenderComponent';
import { provideGroup } from '@/__tests__/fixtures/group';
import { provideTestCompositionRoot } from '@/__tests__/CompositionRootTesting';
import type { CompositionRoot } from '@/CompositionRoot';

vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(() => false),
}));

describe('AddExpenseDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildGroupWithInactiveParticipant() {
    return provideGroup({
      id: 'g1',
      name: 'Test Group',
      currency: 'USD',
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1', isActive: true },
        { id: 'p2', displayName: 'Bob', type: 'REGISTERED', userId: 'user-2', isActive: true },
        { id: 'p3', displayName: 'Inactive Charlie', type: 'NON_REGISTERED', isActive: false },
      ],
    });
  }

  function buildMockCompositionRoot(): CompositionRoot {
    const root = provideTestCompositionRoot();
    return {
      ...root,
      useCases: {
        ...root.useCases,
        expenses: {
          ...root.useCases.expenses,
          create: {
            execute: vi.fn().mockResolvedValue({}),
          } as unknown as CompositionRoot['useCases']['expenses']['create'],
        },
      },
    };
  }

  it('should not render inactive participants in payer selector or split list', () => {
    const group = buildGroupWithInactiveParticipant();
    const compositionRoot = buildMockCompositionRoot();

    RenderComponent(
      <AddExpenseDialog
        open={true}
        onClose={vi.fn()}
        onExpenseCreated={vi.fn()}
        group={group}
      />,
      {
        compositionRoot,
        authContext: {
          ...defaultTestAuthContextValue,
          user: defaultTestAuthContextValue.user,
        },
      },
    );

    // Verify active participants are present somewhere in the dialog
    expect(screen.queryAllByText('Alice').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Bob').length).toBeGreaterThan(0);

    // Verify inactive participant is NOT present anywhere
    expect(screen.queryByText('Inactive Charlie')).not.toBeInTheDocument();
  });
});
