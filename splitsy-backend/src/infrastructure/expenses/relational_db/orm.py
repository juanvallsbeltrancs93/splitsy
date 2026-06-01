from __future__ import annotations

from sqlalchemy import DateTime, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infrastructure.common.base_orm import Base, TimestampMixin


class ExpenseORM(Base, TimestampMixin):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    amount: Mapped[float] = mapped_column(
        Numeric(precision=18, scale=2), nullable=False
    )
    date: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    group_id: Mapped[str] = mapped_column(nullable=False)
    paid_by: Mapped[str] = mapped_column(nullable=False)
    description: Mapped[str | None] = mapped_column(nullable=True)

    splits: Mapped[list[ExpenseSplitORM]] = relationship(
        "ExpenseSplitORM",
        back_populates="expense",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ExpenseSplitORM(Base):
    __tablename__ = "expense_splits"

    id: Mapped[str] = mapped_column(primary_key=True)
    expense_id: Mapped[str] = mapped_column(
        ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False
    )
    participant_id: Mapped[str] = mapped_column(nullable=False)
    amount: Mapped[float] = mapped_column(
        Numeric(precision=18, scale=2), nullable=False
    )

    expense: Mapped[ExpenseORM] = relationship("ExpenseORM", back_populates="splits")
