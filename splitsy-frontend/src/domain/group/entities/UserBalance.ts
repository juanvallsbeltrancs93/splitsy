import { Id } from "../../shared/value-objects/Id";

export interface UserBalanceProps {
  participantId: number | string;
  balance: number;
}

export interface UserBalanceAttributes {
  participantId: Id;
  balance: number;
}

export class UserBalance {
  public readonly participantId: Id;
  public readonly balance: number;

  constructor(attributes: UserBalanceAttributes) {
    this.participantId = attributes.participantId;
    this.balance = attributes.balance;
  }

  public static create(props: UserBalanceProps): UserBalance {
    return new UserBalance({
      participantId: Id.createFrom(String(props.participantId)),
      balance: props.balance,
    });
  }
}
