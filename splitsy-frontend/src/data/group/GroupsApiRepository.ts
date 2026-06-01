import type { GroupRepository } from '../../domain/group/repository/GroupRepository';
import type {
  AddParticipantParams,
  ClaimParticipantParams,
  CreateGroupParams,
  DeleteGroupParams,
  GetBalancesParams,
  GetGroupParams,
  ListGroupsParams,
  RemoveParticipantParams,
  UpdateGroupParams,
} from '../../domain/group/repository/types';
import { Group } from '../../domain/group/entities/Group';
import { Participant } from '../../domain/group/entities/Participant';
import { UserBalance } from '../../domain/group/entities/UserBalance';
import type { GroupsApi } from '../apis/groups/groupsApi';
import type { GroupResponseDto } from '../apis/groups/types';
import { translateApiError } from '../shared/translateApiError';

function mapGroup(dto: GroupResponseDto): Group {
  return Group.create({
    id: dto.id,
    name: dto.name,
    currency: dto.currency,
    ownerId: dto.owner_id ?? '',
    participants: dto.participants.map((p) =>
      Participant.create({
        id: p.id,
        displayName: p.display_name,
        type: p.type,
        userId: p.user_id ?? undefined,
        isActive: p.is_active ?? true,
      }),
    ),
  });
}

export class GroupsApiRepository implements GroupRepository {
  constructor(private readonly api: GroupsApi) {}

  async listGroups(_params: ListGroupsParams): Promise<Group[]> {
    try {
      const dtos = await this.api.list();
      return dtos.map(mapGroup);
    } catch (error) {
      translateApiError(error, 'Group');
    }
  }

  async createGroup(params: CreateGroupParams): Promise<Group> {
    try {
      const dto = await this.api.create(params.body);
      return mapGroup(dto);
    } catch (error) {
      translateApiError(error, 'Group');
    }
  }

  async getGroup(params: GetGroupParams): Promise<Group> {
    try {
      const dto = await this.api.get(params.groupId);
      return mapGroup(dto);
    } catch (error) {
      translateApiError(error, 'Group', params.groupId);
    }
  }

  async updateGroup(params: UpdateGroupParams): Promise<Group> {
    try {
      const dto = await this.api.update(params.groupId, params.body);
      return mapGroup(dto);
    } catch (error) {
      translateApiError(error, 'Group', params.groupId);
    }
  }

  async deleteGroup(params: DeleteGroupParams): Promise<void> {
    try {
      await this.api.delete(params.groupId);
    } catch (error) {
      translateApiError(error, 'Group', params.groupId);
    }
  }

  async addParticipant(params: AddParticipantParams): Promise<Group> {
    try {
      const dto = await this.api.addParticipant(params.groupId, {
        type: params.body.type,
        user_id: params.body.user_id,
        display_name: params.body.display_name,
      });
      return mapGroup(dto);
    } catch (error) {
      translateApiError(error, 'Group', params.groupId);
    }
  }

  async removeParticipant(params: RemoveParticipantParams): Promise<Group> {
    try {
      const dto = await this.api.removeParticipant(params.groupId, params.participantId);
      return mapGroup(dto);
    } catch (error) {
      translateApiError(error, 'Group', params.groupId);
    }
  }

  async getBalances(params: GetBalancesParams): Promise<UserBalance[]> {
    try {
      const dtos = await this.api.getBalances(params.groupId);
      return dtos.map((dto) =>
        UserBalance.create({
          participantId: dto.participant_id,
          balance: dto.balance,
        }),
      );
    } catch (error) {
      translateApiError(error, 'Group', params.groupId);
    }
  }

  async claimParticipant(params: ClaimParticipantParams): Promise<Group> {
    try {
      const dto = await this.api.claimParticipant(params.groupId, params.participantId);
      return mapGroup(dto);
    } catch (error) {
      translateApiError(error, 'Group', params.groupId);
    }
  }
}
