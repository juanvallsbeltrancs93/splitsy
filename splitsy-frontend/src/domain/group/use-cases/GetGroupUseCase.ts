import type { GroupRepository } from '../repository/GroupRepository';
import type { Group } from '../entities/Group';
import type { GetGroupParams } from '../repository/types';

export class GetGroupUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: GetGroupParams): Promise<Group> {
    try {
      return await this.groupRepository.getGroup(props);
    } catch (error) {
      throw new Error(`Error getting group ${props.groupId}: ${error}`);
    }
  }
}
