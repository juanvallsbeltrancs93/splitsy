from __future__ import annotations

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.infrastructure.common.base_orm import Base, TimestampMixin


class GroupORM(Base, TimestampMixin):
    __tablename__ = "groups"

    id: Mapped[str] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(nullable=False)
    # Production migration note: add `currency VARCHAR(3) NOT NULL DEFAULT 'USD'`
    # to the `groups` table, backfill existing rows, then drop the default.
    currency: Mapped[str] = mapped_column(nullable=False)

    participants: Mapped[list[GroupParticipantORM]] = relationship(
        "GroupParticipantORM",
        back_populates="group",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class GroupParticipantORM(Base):
    __tablename__ = "group_participants"

    id: Mapped[str] = mapped_column(primary_key=True)
    group_id: Mapped[str] = mapped_column(
        ForeignKey("groups.id", ondelete="CASCADE"),
        nullable=False,
    )
    display_name: Mapped[str] = mapped_column(nullable=False)
    type: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[str | None] = mapped_column(nullable=True)

    group: Mapped[GroupORM] = relationship("GroupORM", back_populates="participants")
