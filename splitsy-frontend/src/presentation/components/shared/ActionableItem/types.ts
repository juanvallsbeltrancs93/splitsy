export interface ActionableItemProps {
  name: string;
  firstLetter: string;
  actionLabel: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  onAction: () => void;
}
