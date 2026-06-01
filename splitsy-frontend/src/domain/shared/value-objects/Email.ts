import { ValueObject } from "./ValueObject";

export interface EmailAttributes {
  value: string;
}

export class Email extends ValueObject<EmailAttributes> {
  private constructor(props: EmailAttributes) {
    super(props);
  }

  public static create(email: string): Email {
    if (this.isEmpty(email)) {
      throw new Error('Email is a required field');
    }

    if (!this.isValid(email)) {
      throw new Error('Invalid email address');
    }

    return new Email({ value: email });
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isEmpty(email: string): boolean {
    return email.length === 0;
  }

  public get value(): string {
    return this.props.value;
  }
}
