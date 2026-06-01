import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useShareInviteLink } from './useShareInviteLink';

describe('useShareInviteLink', () => {
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });
  });

  it('should copy join link to clipboard when handleShare is called', async () => {
    const { result } = renderHook(() => useShareInviteLink('group-123'));

    await result.current.handleShare();

    expect(writeTextMock).toHaveBeenCalledWith(`${window.location.origin}/join/group-123`);
  });

  it('should set copied to true after successful copy', async () => {
    const { result } = renderHook(() => useShareInviteLink('group-123'));

    expect(result.current.copied).toBe(false);

    await result.current.handleShare();

    await waitFor(() => {
      expect(result.current.copied).toBe(true);
    });
  });

  it('should reset copied to false after timeout', async () => {
    const { result } = renderHook(() => useShareInviteLink('group-123'));

    await result.current.handleShare();

    await waitFor(() => {
      expect(result.current.copied).toBe(true);
    });

    // Wait for the 2-second timeout to expire
    await new Promise((resolve) => setTimeout(resolve, 2100));

    await waitFor(() => {
      expect(result.current.copied).toBe(false);
    });
  });
});
