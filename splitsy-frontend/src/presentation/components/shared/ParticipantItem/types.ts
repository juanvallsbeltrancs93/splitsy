export interface ParticipantItemProps {
  name: string;
  firstLetter: string;
  amount?: string;
  prefix?: string;
  currencySymbol?: string;
  isYou?: boolean;
  isDisabled?: boolean;
  variant?: 'default' | 'positive' | 'negative';
}
