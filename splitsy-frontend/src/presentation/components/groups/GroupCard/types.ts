export interface GroupCardProps {
  id: string;
  name: string;
  participantCount: number;
  onClick: (id: string) => void;
}
