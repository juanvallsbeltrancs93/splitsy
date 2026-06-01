interface CreateExpenseBody {
  name: string;
  amount: number;
  date: string;
  paidBy: string;
  splits: {
    participantId: string;
    amount: number;
  }[];
  description?: string;
}

interface UpdateExpenseBody {
  name?: string;
  amount?: number;
  date?: string;
  paidBy?: string;
  splits?: {
    participantId: string;
    amount: number;
  }[];
  description?: string;
}

export interface CreateExpenseParams {
  groupId: string;
  body: CreateExpenseBody;
}

export interface ListExpensesParams {
  groupId: string;
}

export interface GetExpenseParams {
  expenseId: string;
}

export interface UpdateExpenseParams {
  expenseId: string;
  body: UpdateExpenseBody;
}

export interface DeleteExpenseParams {
  expenseId: string;
}
