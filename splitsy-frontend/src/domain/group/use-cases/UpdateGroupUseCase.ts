import type { GroupRepository } from '../repository/GroupRepository';
import type { Group } from '../entities/Group';
import type { UpdateGroupParams } from '../repository/types';

export class UpdateGroupUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: UpdateGroupParams): Promise<Group> {
    try {
      return await this.groupRepository.updateGroup(props);
    } catch (error) {
      throw new Error(`Error updating group ${props.groupId}: ${error}`);
    }
  }
}
