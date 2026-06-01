import { ValueObject } from "../../shared/value-objects/ValueObject";

export interface SplitProps {
  participantId: number | string;
  amount: number;
}

export class Split extends ValueObject<SplitProps> {
  private constructor(props: SplitProps) {
    super(props);
  }

  public static create(participantId: number | string, amount: number): Split {
    if (participantId === null || participantId === undefined || participantId === '') {
      throw new Error("ParticipantId missing in split");
    }

    if (amount === null || amount === undefined) {
      throw new Error("The split needs an amount");
    }

    if (amount <= 0) {
      throw new Error("Split amount must be greater than 0");
    }

    return new Split({ participantId, amount });
  }

  public get participantId(): number | string {
    return this.props.participantId;
  }

  public get amount(): number {
    return this.props.amount;
  }

  public toJSON() {
    return {
      participantId: this.participantId,
      amount: this.amount,
    };
  }
}
