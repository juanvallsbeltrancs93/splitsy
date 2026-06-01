"""add_is_active_to_group_participants

Revision ID: 1abc875609e6
Revises: 220a01ab7884
Create Date: 2026-05-24 16:53:21.012139

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1abc875609e6"
down_revision: Union[str, Sequence[str], None] = "220a01ab7884"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add column as nullable first so existing rows don't fail.
    op.add_column(
        "group_participants",
        sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.true()),
    )
    # Backfill any rows that didn't pick up the default.
    op.execute("UPDATE group_participants SET is_active = true WHERE is_active IS NULL")
    # Now enforce NOT NULL.
    op.alter_column(
        "group_participants", "is_active", existing_type=sa.Boolean(), nullable=False
    )
    # Remove the server default so the app controls the value.
    op.alter_column(
        "group_participants",
        "is_active",
        existing_type=sa.Boolean(),
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("group_participants", "is_active")
