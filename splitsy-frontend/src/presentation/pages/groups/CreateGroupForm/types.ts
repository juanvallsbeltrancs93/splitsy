export interface CreateGroupFormProps {
  currentUserName: string;
  name: string;
  nameError: string | null;
  currency: string;
  aliases: string[];
  newAlias: string;
  submitError: string | null;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onCurrencyChange: (value: string) => void;
  onNewAliasChange: (value: string) => void;
  onAddAlias: () => void;
  onRemoveAlias: (index: number) => void;
  onSubmit: () => void;
}
