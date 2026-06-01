import { ValueObject } from "./ValueObject";

export interface IdProps {
  value: string;
}

export class Id extends ValueObject<IdProps> {
  private constructor(props: IdProps) {
    super(props);
  }

  public static create(): Id {
    return new Id({ value: Math.random().toString(36).replace('0.', '') })
  }

  public static createFrom(value: string): Id {
    return new Id({ value })
  }

  public equals(id: Id): boolean {
    return this.value === id.value;
  }

  public get value(): string {
    return this.props.value;
  }
}