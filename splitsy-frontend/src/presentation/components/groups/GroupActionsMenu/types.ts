export interface GroupActionsMenuProps {
  onEdit: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export interface UseGroupActionsMenuReturn {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleOpen: (event: React.MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
  handleEdit: () => void;
  handleDelete: () => void;
  handleShare: () => void;
}
