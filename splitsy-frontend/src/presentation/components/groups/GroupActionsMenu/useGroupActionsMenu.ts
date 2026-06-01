import { useState, useCallback } from 'react';
import type { GroupActionsMenuProps, UseGroupActionsMenuReturn } from './types';

export function useGroupActionsMenu({ onEdit, onDelete, onShare }: GroupActionsMenuProps): UseGroupActionsMenuReturn {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEdit = useCallback(() => {
    setAnchorEl(null);
    onEdit();
  }, [onEdit]);

  const handleDelete = useCallback(() => {
    setAnchorEl(null);
    onDelete();
  }, [onDelete]);

  const handleShare = useCallback(() => {
    setAnchorEl(null);
    onShare?.();
  }, [onShare]);

  return { anchorEl, open, handleOpen, handleClose, handleEdit, handleDelete, handleShare };
}
