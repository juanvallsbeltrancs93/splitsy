import { ValueObject } from "./ValueObject";

export interface NameProps {
  value: string;
}

export class Name extends ValueObject<NameProps> {
  private constructor(props: NameProps) {
    super(props);
  }

  public static create(name: string): Name {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (name.trim().length > 100) {
      throw new Error('Name must be at most 100 characters');
    }
    return new Name({ value: this.format(name) })
  }

  public get value(): string {
    return this.props.value;
  }

  public static format(name: string): string {
    return name.trim();
  }
}