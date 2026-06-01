import { useState, useCallback, useRef } from 'react';

export interface UseShareInviteLinkReturn {
  handleShare: () => Promise<void>;
  copied: boolean;
}

export function useShareInviteLink(groupId: string): UseShareInviteLinkReturn {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShare = useCallback(async () => {
    const link = `${window.location.origin}/join/${groupId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [groupId]);

  return { handleShare, copied };
}
