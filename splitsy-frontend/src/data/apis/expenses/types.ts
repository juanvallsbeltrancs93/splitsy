export interface SplitDto {
  participant_id: string;
  amount: number;
}

export interface ExpenseResponseDto {
  id: string;
  group_id: string;
  name: string;
  amount: number;
  date: string;
  paid_by: string;
  splits: SplitDto[];
  description: string | null;
}

export interface CreateExpenseRequestDto {
  name: string;
  amount: number;
  date: string;
  paid_by: string;
  splits: SplitDto[];
  description?: string;
}

export interface UpdateExpenseRequestDto {
  name?: string;
  amount?: number;
  date?: string;
  paid_by?: string;
  splits?: SplitDto[];
  description?: string;
}
