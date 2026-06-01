export interface ExpenseActionsMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

export interface UseExpenseActionsMenuReturn {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleOpen: (event: React.MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
  handleEdit: (event: React.MouseEvent) => void;
  handleDelete: (event: React.MouseEvent) => void;
  handleDuplicate: (event: React.MouseEvent) => void;
}
