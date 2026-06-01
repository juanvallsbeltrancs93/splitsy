import { UserBalance } from '@domain/group/entities/UserBalance';
import type { UserBalanceProps } from '@domain/group/entities/UserBalance';

export const userBalancePropsMock: UserBalanceProps = {
  participantId: '1',
  balance: 150.50,
};

export const userBalanceMock = UserBalance.create(userBalancePropsMock);

describe('Tests on UserBalance entity', () => {
  it('should create a UserBalance with participantId and balance', () => {
    const ub = UserBalance.create(userBalancePropsMock);
    expect(ub.participantId.value).toBe('1');
    expect(ub.balance).toBe(150.50);
  });

  it('should handle negative balance', () => {
    const ub = UserBalance.create({ participantId: '2', balance: -30 });
    expect(ub.balance).toBe(-30);
  });
});
