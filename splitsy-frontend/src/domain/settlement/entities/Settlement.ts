import { Id } from "../../shared/value-objects/Id";

export interface SettlementProps {
  id?: number | string;
  groupId: number | string;
  fromParticipantId: number | string;
  toParticipantId: number | string;
  amount: number;
  date: string;
  note?: string;
}

export interface SettlementAttributes {
  id: Id;
  groupId: Id;
  fromParticipantId: Id;
  toParticipantId: Id;
  amount: number;
  date: string;
  note?: string;
}

export class Settlement {
  public readonly id: Id;
  public readonly groupId: Id;
  public readonly fromParticipantId: Id;
  public readonly toParticipantId: Id;
  public readonly amount: number;
  public readonly date: string;
  public readonly note?: string;

  constructor(attributes: SettlementAttributes) {
    this.id = attributes.id;
    this.groupId = attributes.groupId;
    this.fromParticipantId = attributes.fromParticipantId;
    this.toParticipantId = attributes.toParticipantId;
    this.amount = attributes.amount;
    this.date = attributes.date;
    this.note = attributes.note;
  }

  public static create(props: SettlementProps): Settlement {
    return new Settlement({
      id: props.id ? Id.createFrom(String(props.id)) : Id.create(),
      groupId: Id.createFrom(String(props.groupId)),
      fromParticipantId: Id.createFrom(String(props.fromParticipantId)),
      toParticipantId: Id.createFrom(String(props.toParticipantId)),
      amount: props.amount,
      date: props.date,
      note: props.note,
    });
  }
}
