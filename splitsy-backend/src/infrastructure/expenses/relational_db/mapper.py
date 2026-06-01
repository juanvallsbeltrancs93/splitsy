from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from src.domain.expenses.entities.expense import Expense, ExpenseData, SplitData
from src.infrastructure.common.mapper import Mapper
from src.infrastructure.expenses.relational_db.orm import ExpenseORM, ExpenseSplitORM


class ExpenseMapper(Mapper[Expense, ExpenseORM]):
    def to_entity(self, orm_model: ExpenseORM) -> Expense:
        return Expense.create(
            ExpenseData(
                id=orm_model.id,
                name=orm_model.name,
                amount=Decimal(str(orm_model.amount)),
                date=orm_model.date,
                group_id=orm_model.group_id,
                paid_by=orm_model.paid_by,
                description=orm_model.description,
                splits=[
                    SplitData(participant_id=s.participant_id, amount=Decimal(str(s.amount)))
                    for s in orm_model.splits
                ],
            )
        )

    def to_orm(self, entity: Expense) -> ExpenseORM:
        return ExpenseORM(
            id=entity.id,
            name=entity.name,
            amount=entity.amount,
            date=entity.date,
            group_id=entity.group_id,
            paid_by=entity.paid_by,
            description=entity.description,
            splits=self.to_splits(entity),
        )

    def to_splits(self, entity: Expense) -> list[ExpenseSplitORM]:
        return [
            ExpenseSplitORM(
                id=str(uuid4()),
                expense_id=entity.id,
                participant_id=split["participant_id"],
                amount=split["amount"],
            )
            for split in entity.splits
        ]
