export interface DeleteGroupDialogProps {
  groupId: string;
  open: boolean;
  groupName: string;
  onClose: () => void;
}

export interface UseDeleteGroupDialogProps {
  groupId: string;
  onClose: () => void;
}
