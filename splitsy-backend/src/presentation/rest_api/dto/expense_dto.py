from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from src.domain.expenses.entities.expense import Expense, ExpenseData, SplitData


class SplitDTO(BaseModel):
    participant_id: str = Field(..., description="UUID of the participant responsible for this split")
    amount: Decimal = Field(..., gt=0, description="Amount this participant owes")


class ExpenseCreateDTO(BaseModel):
    name: str = Field(
        ..., min_length=1, max_length=100, description="Expense name", example="Dinner"
    )
    amount: Decimal = Field(
        ..., gte=0, description="Total expense amount", example=90.00
    )
    date: datetime = Field(..., description="Date of the expense")
    paid_by: str = Field(..., description="UUID of the user who paid")
    splits: list[SplitDTO] = Field(
        ..., min_length=1, description="How the expense is split"
    )
    description: str | None = Field(
        None, max_length=500, description="Optional description"
    )


class ExpenseUpdateDTO(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    amount: Decimal | None = Field(None, gt=0)
    date: datetime | None = None
    paid_by: str | None = None
    splits: list[SplitDTO] | None = Field(None, min_length=1)
    description: str | None = None

    def merge_with(self, existing: Expense) -> ExpenseData:
        return ExpenseData(
            id=existing.id,
            name=self.name if self.name is not None else existing.name,
            amount=self.amount if self.amount is not None else existing.amount,
            date=self.date if self.date is not None else existing.date,
            group_id=existing.group_id,
            paid_by=self.paid_by if self.paid_by is not None else existing.paid_by,
            splits=(
                [SplitData(participant_id=s.participant_id, amount=s.amount) for s in self.splits]
                if self.splits is not None
                else [
                    SplitData(participant_id=s["participant_id"], amount=s["amount"])
                    for s in existing.splits
                ]
            ),
            description=self.description
            if self.description is not None
            else existing.description,
        )


class ExpenseResponseDTO(BaseModel):
    id: str
    name: str
    amount: Decimal
    date: datetime
    group_id: str
    paid_by: str
    splits: list[SplitDTO]
    description: str | None

    @classmethod
    def from_entity(cls, expense) -> ExpenseResponseDTO:
        return cls(
            id=expense.id,
            name=expense.name,
            amount=expense.amount,
            date=expense.date,
            group_id=expense.group_id,
            paid_by=expense.paid_by,
            splits=[
                SplitDTO(participant_id=s["participant_id"], amount=s["amount"])
                for s in expense.splits
            ],
            description=expense.description,
        )
