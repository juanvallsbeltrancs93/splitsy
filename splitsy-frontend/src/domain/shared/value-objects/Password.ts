import { ValueObject } from "./ValueObject";

interface PasswordAttributes {
  value: string;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export class Password extends ValueObject<PasswordAttributes> {
  private constructor(props: PasswordAttributes) {
    super(props);
  }

  public static create(password: string): Password {
    if (!password || password.length === 0) {
      throw new Error('Password is required')
    }
    if (!PASSWORD_REGEX.test(password)) {
      throw new Error('Password must be at least 8 characters and include uppercase, lowercase, a number and a special character')
    }
    return new Password({ value: password })
  }

  public get value(): string {
    return this.props.value;
  }
}
