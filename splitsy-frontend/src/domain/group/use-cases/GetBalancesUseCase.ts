import type { GroupRepository } from '../repository/GroupRepository';
import type { UserBalance } from '../entities/UserBalance';
import type { GetBalancesParams } from '../repository/types';

export class GetBalancesUseCase {
  constructor(private groupRepository: GroupRepository) {}

  async execute(props: GetBalancesParams): Promise<UserBalance[]> {
    try {
      return await this.groupRepository.getBalances(props);
    } catch (error) {
      throw new Error(`Error getting balances for group ${props.groupId}: ${error}`);
    }
  }
}
