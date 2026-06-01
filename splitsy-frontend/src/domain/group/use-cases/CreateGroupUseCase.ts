import type { GroupRepository } from '../repository/GroupRepository';
import type { Group } from '../entities/Group';
import type { CreateGroupParams } from '../repository/types';

export class CreateGroupUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: CreateGroupParams): Promise<Group> {
    try {
      return await this.groupRepository.createGroup(props);
    } catch (error) {
      throw new Error(`Error creating group: ${error}`);
    }
  }
}
