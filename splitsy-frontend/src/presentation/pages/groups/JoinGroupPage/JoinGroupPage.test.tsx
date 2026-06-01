import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useLoaderData: vi.fn(),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../utils/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useLoaderData } from 'react-router-dom';
import { useAuth } from '../../../utils/hooks/useAuth';
import { JoinGroupPage } from './JoinGroupPage';
import { RenderComponent } from '@/__tests__/utils/RenderComponent';
import { User } from '@/domain/users/entities/User';
import { provideGroupWithParticipants } from '@/__tests__/fixtures/group';

const mockNavigate = vi.fn();
const mockedUseLoaderData = vi.mocked(useLoaderData);
const mockedUseAuth = vi.mocked(useAuth);

describe('JoinGroupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render alias list for available spots', () => {
    const group = provideGroupWithParticipants({
      name: 'Trip Group',
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' },
        { id: 'p2', displayName: 'Bob', type: 'NON_REGISTERED' },
      ],
    });
    mockedUseLoaderData.mockReturnValue({ group });
    mockedUseAuth.mockReturnValue({
      user: User.create({ id: 'user-2', name: 'Test User', email: 'test@example.com' }),
      isAuthenticated: true,
      isInitializing: false,
      compositionRoot: null,
    } as any);

    RenderComponent(<JoinGroupPage />);

    expect(screen.getByText('Join Trip Group')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Claim Bob' })).toBeInTheDocument();
  });

  it('should show no available spots message when all taken', () => {
    const group = provideGroupWithParticipants({
      name: 'Full Group',
      participants: [
        { id: 'p1', displayName: 'Alice', type: 'REGISTERED', userId: 'user-1' },
        { id: 'p2', displayName: 'Bob', type: 'REGISTERED', userId: 'user-2' },
      ],
    });
    mockedUseLoaderData.mockReturnValue({ group });
    mockedUseAuth.mockReturnValue({
      user: User.create({ id: 'user-3', name: 'Test User', email: 'test@example.com' }),
      isAuthenticated: true,
      isInitializing: false,
      compositionRoot: null,
    } as any);

    RenderComponent(<JoinGroupPage />);

    expect(screen.getByText('Join Full Group')).toBeInTheDocument();
    expect(screen.getByText('No available spots')).toBeInTheDocument();
  });

  it('should show loading state when auth is initializing', () => {
    mockedUseLoaderData.mockReturnValue({ group: null });
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isInitializing: true,
      compositionRoot: null,
    } as any);

    RenderComponent(<JoinGroupPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
