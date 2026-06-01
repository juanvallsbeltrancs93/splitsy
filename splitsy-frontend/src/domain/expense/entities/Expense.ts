import { Id } from "../../shared/value-objects/Id";
import { Split } from "../value-objects/Split";

export interface ExpenseProps {
  id?: number | string;
  groupId: number | string;
  name: string;
  amount: number;
  date: string;
  paidBy: number | string;
  splits: {
    participantId: number | string;
    amount: number;
  }[];
  description?: string;
}

export interface ExpenseAttributes {
  id: Id;
  groupId: Id;
  name: string;
  amount: number;
  date: string;
  paidBy: Id;
  splits: Split[];
  description?: string;
}

export class Expense {
  public readonly id: Id;
  public readonly groupId: Id;
  public readonly name: string;
  public readonly amount: number;
  public readonly date: string;
  public readonly paidBy: Id;
  public readonly splits: Split[];
  public readonly description?: string;

  constructor(attributes: ExpenseAttributes) {
    this.id = attributes.id;
    this.groupId = attributes.groupId;
    this.name = attributes.name;
    this.amount = attributes.amount;
    this.date = attributes.date;
    this.paidBy = attributes.paidBy;
    this.splits = attributes.splits;
    this.description = attributes.description;
  }

  public static create(props: ExpenseProps): Expense {
    return new Expense({
      id: props.id
        ? Id.createFrom(String(props.id))
        : Id.create(),

      groupId: Id.createFrom(String(props.groupId)),

      name: props.name,

      amount: props.amount,

      date: props.date,

      paidBy: Id.createFrom(String(props.paidBy)),

      splits: props.splits?.length
        ? props.splits.map((split) =>
            Split.create(split.participantId, split.amount)
          )
        : [],

      description: props.description,
    });
  }
}
