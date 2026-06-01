import type { GroupRepository } from '../repository/GroupRepository';
import type { Group } from '../entities/Group';
import type { AddParticipantParams } from '../repository/types';

export class AddParticipantUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: AddParticipantParams): Promise<Group> {
    try {
      return await this.groupRepository.addParticipant(props);
    } catch (error) {
      throw new Error(`Error adding participant to group ${props.groupId}: ${error}`);
    }
  }
}
