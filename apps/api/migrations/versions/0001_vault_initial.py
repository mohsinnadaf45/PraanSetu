"""Vault migration: create identity tables."""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0001_vault_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "identity",
        sa.Column("code", sa.String(20), primary_key=True),
        sa.Column("name_enc", sa.Text(), nullable=True),
        sa.Column("phone_enc", sa.Text(), nullable=True),
        sa.Column("address_enc", sa.Text(), nullable=True),
        sa.Column("gov_id_enc", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "identity_reveal",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("code", sa.String(20), sa.ForeignKey("identity.code", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("requested_by", sa.String(50), nullable=False),
        sa.Column("approved_by", sa.String(50), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("time", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("identity_reveal")
    op.drop_table("identity")
