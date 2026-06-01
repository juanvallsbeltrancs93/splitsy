import { useState, useCallback } from 'react';
import type { ExpenseActionsMenuProps, UseExpenseActionsMenuReturn } from './types';

export function useExpenseActionsMenu({ onEdit, onDelete, onDuplicate }: ExpenseActionsMenuProps): UseExpenseActionsMenuReturn {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEdit = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(null);
    onEdit();
  }, [onEdit]);

  const handleDuplicate = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(null);
    onDuplicate?.();
  }, [onDuplicate]);

  const handleDelete = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(null);
    onDelete();
  }, [onDelete]);

  return { anchorEl, open, handleOpen, handleClose, handleEdit, handleDuplicate, handleDelete };
}
