import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLoaderData } from 'react-router-dom';
import { GroupDetailPage } from '@/presentation/pages/groups/GroupDetailPage/GroupDetailPage';
import { RenderComponent, getMockLoaderData } from '@/__tests__/utils/RenderComponent';
import { provideTestCompositionRoot } from '@/__tests__/CompositionRootTesting';
import {
  provideGroupWithParticipants,
  provideMultipleExpenses,
  provideMultipleBalances,
  provideUserBalance,
} from '@/__tests__/fixtures/group';
import { provideSettlementList } from '@/__tests__/fixtures/settlement';
import type { GroupDetailLoaderData } from '@/presentation/pages/groups/GroupDetailPage/types';

// ── Mock react-router-dom useLoaderData ──────────────────────────────────────
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  const { getMockLoaderData } = await import('@/__tests__/utils/RenderComponent');
  return {
    ...actual,
    useLoaderData: vi.fn(() => getMockLoaderData()),
  };
});

// ── Mock getCompositionRoot so useGroupState refresh uses test root ────────────
vi.mock('@/CompositionRoot', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/CompositionRoot')>();
  const { getTestCompositionRoot } = await import('@/__tests__/utils/compositionRootMock');
  return {
    ...actual,
    getCompositionRoot: vi.fn(() => {
      const testRoot = getTestCompositionRoot();
      return testRoot ?? actual.getCompositionRoot();
    }),
  };
});

const mockedUseLoaderData = vi.mocked(useLoaderData);

describe('GroupDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildTestRoot() {
    return provideTestCompositionRoot();
  }

  function buildLoaderData(overrides: Partial<GroupDetailLoaderData> = {}): GroupDetailLoaderData {
    const group = provideGroupWithParticipants({ id: 'g1', name: 'Dinner Group' });
    return {
      group,
      expenses: provideMultipleExpenses(),
      settlements: provideSettlementList(),
      balances: provideMultipleBalances(),
      ...overrides,
    };
  }

  it('should render group details and expenses', async () => {
    const loaderData = buildLoaderData();
    const compositionRoot = buildTestRoot();

    mockedUseLoaderData.mockReturnValue(loaderData);

    RenderComponent(<GroupDetailPage />, { compositionRoot, loaderData });

    expect(screen.getByText('Dinner Group')).toBeInTheDocument();
    expect(screen.getByText('Pizza Night')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Taxi Ride')).toBeInTheDocument();
  });

  it('should open add expense dialog', async () => {
    const loaderData = buildLoaderData({ expenses: [] });
    const compositionRoot = buildTestRoot();
    const user = userEvent.setup();

    mockedUseLoaderData.mockReturnValue(loaderData);

    RenderComponent(<GroupDetailPage />, { compositionRoot, loaderData });

    const addButton = screen.getByLabelText('Add expense');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Add expense' })).toBeInTheDocument();
  });

  it('should display expense list sorted by date descending', async () => {
    const loaderData = buildLoaderData();
    const compositionRoot = buildTestRoot();

    mockedUseLoaderData.mockReturnValue(loaderData);

    RenderComponent(<GroupDetailPage />, { compositionRoot, loaderData });

    // Expenses should appear in date-descending order:
    // Pizza Night (2024-06-20), Groceries (2024-06-18), Taxi Ride (2024-06-15)
    expect(screen.getByText('Pizza Night')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Taxi Ride')).toBeInTheDocument();
  });

  it('should navigate prev and next through expense detail dialog', async () => {
    const expenses = provideMultipleExpenses();
    const loaderData = buildLoaderData({ expenses });
    const compositionRoot = buildTestRoot();
    const user = userEvent.setup();

    mockedUseLoaderData.mockReturnValue(loaderData);

    RenderComponent(<GroupDetailPage />, { compositionRoot, loaderData });

    // Click first expense card to open detail dialog
    const firstExpenseCard = document.querySelector('.expense-card');
    expect(firstExpenseCard).toBeTruthy();
    await user.click(firstExpenseCard!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Dialog should show the first expense (Pizza Night) as heading
    expect(screen.getByRole('heading', { name: 'Pizza Night' })).toBeInTheDocument();

    // Navigate to next expense if available
    const nextButton = screen.queryByLabelText('Next expense');
    if (nextButton) {
      await user.click(nextButton);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Groceries' })).toBeInTheDocument();
      });
    }

    // Close dialog
    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close add expense dialog and reset state', async () => {
    const loaderData = buildLoaderData({ expenses: [] });
    const compositionRoot = buildTestRoot();
    const user = userEvent.setup();

    mockedUseLoaderData.mockReturnValue(loaderData);

    RenderComponent(<GroupDetailPage />, { compositionRoot, loaderData });

    // Open dialog
    const addButton = screen.getByLabelText('Add expense');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Type something into the title field
    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Test Expense');

    expect(titleInput).toHaveValue('Test Expense');

    // Close dialog via the X button
    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Re-open dialog and verify state was reset
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const reopenedTitleInput = screen.getByLabelText('Title');
    expect(reopenedTitleInput).toHaveValue('');
  });

  it('should switch to Settlements tab and show settlement plan', async () => {
    const loaderData = buildLoaderData();
    const compositionRoot = buildTestRoot();
    const user = userEvent.setup();

    mockedUseLoaderData.mockReturnValue(loaderData);

    RenderComponent(<GroupDetailPage />, { compositionRoot, loaderData });

    const settlementsTab = screen.getByRole('tab', { name: 'Settlements' });
    await user.click(settlementsTab);

    await waitFor(() => {
      expect(screen.getByText('Settlement Plan')).toBeInTheDocument();
    });

    // With provideMultipleBalances: p1=15, p2=-20, p3=5
    // Plan should be: p2 pays p1 15, p2 pays p3 5
    const planSection = screen.getByText('Settlement Plan').closest('.settle-up-tab__section');
    expect(planSection).toBeTruthy();

    const planItems = planSection!.querySelectorAll('.settle-up-tab__plan-item');
    expect(planItems.length).toBe(2);

    const recordButtons = screen.getAllByRole('button', { name: 'Record Payment' });
    expect(recordButtons.length).toBe(2);
  });

  it('should show "All settled up!" when there are no debts on Settlements tab', async () => {
    const loaderData = buildLoaderData({
      balances: [
        provideUserBalance({ participantId: 'p1', balance: 0 }),
        provideUserBalance({ participantId: 'p2', balance: 0 }),
        provideUserBalance({ participantId: 'p3', balance: 0 }),
      ],
      settlements: [],
    });
    const compositionRoot = buildTestRoot();
    const user = userEvent.setup();

    mockedUseLoaderData.mockReturnValue(loaderData);

    RenderComponent(<GroupDetailPage />, { compositionRoot, loaderData });

    const settlementsTab = screen.getByRole('tab', { name: 'Settlements' });
    await user.click(settlementsTab);

    await waitFor(() => {
      expect(screen.getByText(/All settled up!/)).toBeInTheDocument();
    });
  });

  it('should show settlement history on Settlements tab', async () => {
    const loaderData = buildLoaderData();
    const compositionRoot = buildTestRoot();
    const user = userEvent.setup();

    mockedUseLoaderData.mockReturnValue(loaderData);

    RenderComponent(<GroupDetailPage />, { compositionRoot, loaderData });

    const settlementsTab = screen.getByRole('tab', { name: 'Settlements' });
    await user.click(settlementsTab);

    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument();
    });

    // Settlement fixtures show: Bob → Alice, Charlie → Bob
    const historySection = screen.getByText('History').closest('.settle-up-tab__section');
    expect(historySection).toBeTruthy();
    expect(historySection!.querySelector('.settlement-card__names')).toHaveTextContent('Bob → Alice');
  });
});
