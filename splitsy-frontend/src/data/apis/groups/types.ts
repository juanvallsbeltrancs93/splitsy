export interface ParticipantDto {
  id: string;
  display_name: string;
  type: string;
  user_id: string | null;
  is_active?: boolean;
}

export interface GroupResponseDto {
  id: string;
  name: string;
  currency: string;
  owner_id?: string;
  participants: ParticipantDto[];
}

export interface CreateGroupRequestDto {
  name: string;
  aliases?: string[];
  currency?: string;
}

export interface UpdateGroupRequestDto {
  name?: string;
}

export interface AddParticipantRequestDto {
  type: string;
  user_id?: string;
  display_name?: string;
}

export interface BalanceResponseDto {
  participant_id: string;
  balance: number;
}
