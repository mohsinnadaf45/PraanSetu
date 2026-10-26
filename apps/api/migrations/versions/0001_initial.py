"""Initial schema migration."""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # hospital
    op.create_table(
        "hospital",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("region", sa.String(100), nullable=False),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # user_role enum
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE user_role AS ENUM
                ('coordinator','doctor','committee','auditor','authority','admin');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)

    # organ_type enum
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE organ_type AS ENUM
                ('kidney','liver','heart','lung','pancreas');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)

    # blood_group_type enum
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE blood_group_type AS ENUM
                ('A+','A-','B+','B-','AB+','AB-','O+','O-');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)

    # app_user
    op.create_table(
        "app_user",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("hospital_id", sa.String(36), sa.ForeignKey("hospital.id", ondelete="SET NULL"), nullable=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("coordinator","doctor","committee","auditor","authority","admin", name="user_role", create_type=False), nullable=False),
        sa.Column("mfa_enabled", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("totp_secret", sa.String(64), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("failed_login_attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # donor
    op.create_table(
        "donor",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("donor_code", sa.String(20), nullable=False, unique=True, index=True),
        sa.Column("hospital_id", sa.String(36), sa.ForeignKey("hospital.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("organ", sa.Enum("kidney","liver","heart","lung","pancreas", name="organ_type", create_type=False), nullable=False),
        sa.Column("blood_group", sa.Enum("A+","A-","B+","B-","AB+","AB-","O+","O-", name="blood_group_type", create_type=False), nullable=False),
        sa.Column("size_kg", sa.Float(), nullable=True),
        sa.Column("age_years", sa.Integer(), nullable=True),
        sa.Column("test_results", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("status", sa.String(20), nullable=False, server_default="available"),
        sa.Column("registered_by", sa.String(36), sa.ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # recipient
    op.create_table(
        "recipient",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("recipient_code", sa.String(20), nullable=False, unique=True, index=True),
        sa.Column("hospital_id", sa.String(36), sa.ForeignKey("hospital.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("organ", sa.Enum("kidney","liver","heart","lung","pancreas", name="organ_type", create_type=False), nullable=False),
        sa.Column("blood_group", sa.Enum("A+","A-","B+","B-","AB+","AB-","O+","O-", name="blood_group_type", create_type=False), nullable=False),
        sa.Column("size_kg", sa.Float(), nullable=True),
        sa.Column("age_years", sa.Integer(), nullable=True),
        sa.Column("hla", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("urgency", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("listed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("status", sa.String(20), nullable=False, server_default="waiting"),
        sa.Column("registered_by", sa.String(36), sa.ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # rule_version
    op.create_table(
        "rule_version",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("organ", sa.String(50), nullable=False),
        sa.Column("version_tag", sa.String(50), nullable=False),
        sa.Column("weights_yaml_hash", sa.String(64), nullable=False),
        sa.Column("approved_by", sa.String(36), sa.ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True),
        sa.Column("effective_from", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("organ", "version_tag", name="uq_rule_version"),
    )

    # match_run
    op.create_table(
        "match_run",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("donor_id", sa.String(36), sa.ForeignKey("donor.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("donor_code", sa.String(20), nullable=False),
        sa.Column("rule_version_id", sa.String(36), sa.ForeignKey("rule_version.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("result_json", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("run_by", sa.String(36), sa.ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # offer
    op.create_table(
        "offer",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("match_run_id", sa.String(36), sa.ForeignKey("match_run.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("recipient_id", sa.String(36), sa.ForeignKey("recipient.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("recipient_code", sa.String(20), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("responded_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # decision
    op.create_table(
        "decision",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("offer_id", sa.String(36), sa.ForeignKey("offer.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("committee_user_id", sa.String(36), sa.ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True),
        sa.Column("outcome", sa.String(20), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # audit_log (append-only)
    op.create_table(
        "audit_log",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("time", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False, index=True),
        sa.Column("actor_code", sa.String(50), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("payload_hash", sa.String(64), nullable=False),
        sa.Column("prev_hash", sa.String(64), nullable=False),
        sa.Column("entry_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("extra", postgresql.JSONB(), nullable=False, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_table("audit_log")
    op.drop_table("decision")
    op.drop_table("offer")
    op.drop_table("match_run")
    op.drop_table("rule_version")
    op.drop_table("recipient")
    op.drop_table("donor")
    op.drop_table("app_user")
    op.drop_table("hospital")
    op.execute("DROP TYPE IF EXISTS user_role;")
    op.execute("DROP TYPE IF EXISTS organ_type;")
    op.execute("DROP TYPE IF EXISTS blood_group_type;")
