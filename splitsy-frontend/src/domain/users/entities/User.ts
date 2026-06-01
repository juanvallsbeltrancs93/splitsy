import { Email } from "../../shared/value-objects/Email";
import { Id } from "../../shared/value-objects/Id";
import { Password } from "../../shared/value-objects/Password";

export interface UserProps {
  id?: number | string;
  name: string;
  email: string;
  password?: string;
}

export interface UserAttributes {
  id: Id;
  name: string;
  email: Email;
  password?: Password;
}

export class User {
  public readonly id: Id;

  public readonly name: string;

  public readonly email: Email;

  public readonly password?: Password

  constructor(attributes: UserAttributes) {
    this.id = attributes.id;
    this.name = attributes.name;
    this.email = attributes.email;
    this.password = attributes.password;
  }

  public static create(props: UserProps): User {
    return new User({
      id: props.id ? Id.createFrom(String(props.id)) : Id.create(),
      name: props.name,
      email: Email.create(props.email),
      password: props.password ? Password.create(props.password) : undefined,
    })
  }
}