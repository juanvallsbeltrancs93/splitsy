import type { GroupRepository } from '../repository/GroupRepository';
import type { ClaimParticipantParams } from '../repository/types';
import type { Group } from '../entities/Group';

export class ClaimParticipantUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: ClaimParticipantParams): Promise<Group> {
    try {
      return await this.groupRepository.claimParticipant(props);
    } catch (error) {
      throw new Error(`Error claiming participant ${props.participantId}: ${error}`);
    }
  }
}
