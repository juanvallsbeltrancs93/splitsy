"""add owner_id to groups

Revision ID: 3f8c2a1d4e57
Revises: 1abc875609e6
Create Date: 2026-05-31 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3f8c2a1d4e57"
down_revision: Union[str, Sequence[str], None] = "1abc875609e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Step 1: add column as nullable so existing rows don't fail.
    op.add_column("groups", sa.Column("owner_id", sa.String(), nullable=True))

    # Step 2: backfill — for each group, use the first registered participant's id;
    # fall back to first participant of any type; leave NULL (with warning) if none.
    op.execute("""
        UPDATE groups
        SET owner_id = (
            SELECT gp.id
            FROM group_participants gp
            WHERE gp.group_id = groups.id
              AND gp.type = 'REGISTERED'
              AND gp.user_id IS NOT NULL
             ORDER BY gp.id
            LIMIT 1
        )
        WHERE owner_id IS NULL
    """)

    op.execute("""
        UPDATE groups
        SET owner_id = (
            SELECT gp.id
            FROM group_participants gp
            WHERE gp.group_id = groups.id
             ORDER BY gp.id
            LIMIT 1
        )
        WHERE owner_id IS NULL
    """)

    # Step 3: enforce NOT NULL after backfill.
    # NOTE: if any group still has NULL (no participants at all), this will fail —
    # which is the desired safety behaviour. Operator must resolve those rows first.
    op.alter_column("groups", "owner_id", existing_type=sa.String(), nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("groups", "owner_id")
