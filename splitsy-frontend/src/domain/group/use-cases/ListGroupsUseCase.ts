import type { GroupRepository } from '../repository/GroupRepository';
import type { Group } from '../entities/Group';
import type { ListGroupsParams } from '../repository/types';

export class ListGroupsUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: ListGroupsParams): Promise<Group[]> {
    try {
      return await this.groupRepository.listGroups(props);
    } catch (error) {
      throw new Error(`Error listing groups: ${error}`);
    }
  }
}
