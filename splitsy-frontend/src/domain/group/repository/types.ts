interface CreateGroupBody {
  name: string;
  aliases?: string[];
  currency?: string;
}

interface UpdateGroupBody {
  name?: string;
}

interface AddParticipantBody {
  type: 'REGISTERED' | 'NON_REGISTERED';
  user_id?: string;
  display_name?: string;
}

export type ListGroupsParams = Record<string, never>;

export interface CreateGroupParams {
  body: CreateGroupBody;
}

export interface GetGroupParams {
  groupId: string;
}

export interface UpdateGroupParams {
  groupId: string;
  body: UpdateGroupBody;
}

export interface DeleteGroupParams {
  groupId: string;
}

export interface AddParticipantParams {
  groupId: string;
  body: AddParticipantBody;
}

export interface RemoveParticipantParams {
  groupId: string;
  participantId: string;
}

export interface GetBalancesParams {
  groupId: string;
}

export interface ClaimParticipantParams {
  groupId: string;
  participantId: string;
}
