import type { GroupRepository } from '../repository/GroupRepository';
import type { Group } from '../entities/Group';
import type { RemoveParticipantParams } from '../repository/types';

export class RemoveParticipantUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: RemoveParticipantParams): Promise<Group> {
    try {
      return await this.groupRepository.removeParticipant(props);
    } catch (error) {
      throw new Error(`Error removing participant from group ${props.groupId}: ${error}`);
    }
  }
}
