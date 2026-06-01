import type { GroupRepository } from '../repository/GroupRepository';
import type { DeleteGroupParams } from '../repository/types';

export class DeleteGroupUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: DeleteGroupParams): Promise<void> {
    try {
      return await this.groupRepository.deleteGroup(props);
    } catch (error) {
      throw new Error(`Error deleting group ${props.groupId}: ${error}`);
    }
  }
}
