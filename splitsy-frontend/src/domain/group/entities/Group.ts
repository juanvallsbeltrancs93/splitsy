import { Participant } from "./Participant";

export interface GroupProps {
  id?: number | string;
  name: string;
  currency?: string;
  ownerId?: string;
  participants: Participant[];
}

export interface GroupAttributes {
  id: string;
  name: string;
  currency: string;
  ownerId: string;
  participants: Participant[];
}

export class Group {
  public readonly id: string;

  public readonly name: string;

  public readonly currency: string;

  public readonly ownerId: string;

  public readonly participants: Participant[];

  constructor(attributes: GroupAttributes) {
    this.id = attributes.id;
    this.name = attributes.name;
    this.currency = attributes.currency;
    this.ownerId = attributes.ownerId;
    this.participants = attributes.participants;
  }

  get activeParticipants(): Participant[] {
    return this.participants.filter((p) => p.isActive !== false);
  }

  public static create(props: GroupProps): Group {
    return new Group({
      id: props.id ? String(props.id) : "",
      name: props.name,
      currency: props.currency ?? "USD",
      ownerId: props.ownerId ?? "",
      participants: props.participants.map((p) => Participant.create(p)),
    });
  }
}
