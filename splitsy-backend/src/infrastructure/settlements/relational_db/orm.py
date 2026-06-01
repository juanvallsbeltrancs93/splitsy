from __future__ import annotations

from sqlalchemy import DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from src.infrastructure.common.base_orm import Base, TimestampMixin


class SettlementORM(Base, TimestampMixin):
    __tablename__ = "settlements"

    id: Mapped[str] = mapped_column(primary_key=True)
    group_id: Mapped[str] = mapped_column(nullable=False)
    from_participant_id: Mapped[str] = mapped_column(nullable=False)
    to_participant_id: Mapped[str] = mapped_column(nullable=False)
    amount: Mapped[float] = mapped_column(
        Numeric(precision=18, scale=2), nullable=False
    )
    date: Mapped[str] = mapped_column(DateTime(timezone=True), nullable=False)
    note: Mapped[str | None] = mapped_column(nullable=True)
