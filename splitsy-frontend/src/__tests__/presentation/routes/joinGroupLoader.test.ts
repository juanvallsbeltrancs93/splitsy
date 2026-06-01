import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from 'react-router-dom';

vi.mock('@/CompositionRoot', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/CompositionRoot')>();
  return {
    ...actual,
    getCompositionRoot: vi.fn(),
  };
});

import { getCompositionRoot } from '@/CompositionRoot';
import { joinGroupLoader } from '@/presentation/routes/Routes';

const mockedGetCompositionRoot = vi.mocked(getCompositionRoot);

describe('joinGroupLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should redirect to login with redirect param when no token', async () => {
    const result = await joinGroupLoader({ params: { groupId: 'group-123' } } as any);

    expect(result).toEqual(redirect('/login?redirect=/join/group-123'));
  });

  it('should return group when token exists and fetch succeeds', async () => {
    localStorage.setItem('splitsy_access_token', 'test-token');

    const mockGroup = { id: 'group-123', name: 'Test Group' };
    mockedGetCompositionRoot.mockReturnValue({
      useCases: {
        groups: {
          get: {
            execute: vi.fn().mockResolvedValue(mockGroup),
          },
        },
      },
    } as any);

    const result = await joinGroupLoader({ params: { groupId: 'group-123' } } as any);

    expect(result).toEqual({ group: mockGroup });
  });

  it('should redirect to login with redirect param on fetch error', async () => {
    localStorage.setItem('splitsy_access_token', 'test-token');

    mockedGetCompositionRoot.mockReturnValue({
      useCases: {
        groups: {
          get: {
            execute: vi.fn().mockRejectedValue(new Error('Network error')),
          },
        },
      },
    } as any);

    const result = await joinGroupLoader({ params: { groupId: 'group-123' } } as any);

    expect(result).toEqual(redirect('/login?redirect=/join/group-123'));
  });
});
