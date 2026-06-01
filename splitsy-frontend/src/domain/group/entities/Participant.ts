export type ParticipantType = 'REGISTERED' | 'NON_REGISTERED';

export interface ParticipantProps {
  id: string;
  displayName: string;
  type: ParticipantType;
  userId?: string;
  isActive?: boolean;
}

export class Participant {
  public readonly id: string;
  public readonly displayName: string;
  public readonly type: ParticipantType | string;
  public readonly userId?: string;
  public readonly isActive: boolean;

  constructor(props: ParticipantProps) {
    this.id = props.id;
    this.displayName = props.displayName;
    this.type = props.type;
    this.userId = props.userId ?? undefined;
    this.isActive = props.isActive ?? true;
  }

  public static create(props: ParticipantProps): Participant {
    return new Participant(props);
  }
}
