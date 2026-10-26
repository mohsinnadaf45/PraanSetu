"""SQLAlchemy models for the main database."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Hospital(Base):
    __tablename__ = "hospital"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    name: str = Column(String(255), nullable=False)
    region: str = Column(String(100), nullable=False)
    verified: bool = Column(Boolean, default=False, nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("AppUser", back_populates="hospital")
    donors = relationship("Donor", back_populates="hospital")
    recipients = relationship("Recipient", back_populates="hospital")


class AppUser(Base):
    __tablename__ = "app_user"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    hospital_id: Optional[str] = Column(
        UUID(as_uuid=False), ForeignKey("hospital.id", ondelete="SET NULL"), nullable=True
    )
    email: str = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password: str = Column(String(255), nullable=False)
    role: str = Column(
        Enum(
            "coordinator", "doctor", "committee", "auditor", "authority", "admin",
            name="user_role",
        ),
        nullable=False,
    )
    mfa_enabled: bool = Column(Boolean, default=False, nullable=False)
    totp_secret: Optional[str] = Column(String(64), nullable=True)
    is_active: bool = Column(Boolean, default=True, nullable=False)
    failed_login_attempts: int = Column(Integer, default=0, nullable=False)
    locked_until: Optional[datetime] = Column(DateTime(timezone=True), nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: datetime = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    hospital = relationship("Hospital", back_populates="users")


class Donor(Base):
    __tablename__ = "donor"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    donor_code: str = Column(String(20), unique=True, nullable=False, index=True)
    hospital_id: str = Column(
        UUID(as_uuid=False), ForeignKey("hospital.id", ondelete="RESTRICT"), nullable=False
    )
    organ: str = Column(
        Enum("kidney", "liver", "heart", "lung", "pancreas", name="organ_type"),
        nullable=False,
    )
    blood_group: str = Column(
        Enum("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", name="blood_group_type"),
        nullable=False,
    )
    size_kg: Optional[float] = Column(Integer, nullable=True)  # weight in kg
    age_years: Optional[int] = Column(Integer, nullable=True)
    test_results: dict = Column(JSON, nullable=False, default=dict)
    status: str = Column(
        Enum("available", "matched", "transplanted", "withdrawn", name="donor_status"),
        nullable=False,
        default="available",
    )
    registered_by: str = Column(
        UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True
    )
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: datetime = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    hospital = relationship("Hospital", back_populates="donors")
    match_runs = relationship("MatchRun", back_populates="donor")


class Recipient(Base):
    __tablename__ = "recipient"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    recipient_code: str = Column(String(20), unique=True, nullable=False, index=True)
    hospital_id: str = Column(
        UUID(as_uuid=False), ForeignKey("hospital.id", ondelete="RESTRICT"), nullable=False
    )
    organ: str = Column(
        Enum("kidney", "liver", "heart", "lung", "pancreas", name="organ_type"),
        nullable=False,
    )
    blood_group: str = Column(
        Enum("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", name="blood_group_type"),
        nullable=False,
    )
    size_kg: Optional[float] = Column(Integer, nullable=True)
    age_years: Optional[int] = Column(Integer, nullable=True)
    hla: dict = Column(JSON, nullable=False, default=dict)
    urgency: int = Column(Integer, nullable=False, default=1)  # 1 (low) – 5 (critical)
    listed_at: datetime = Column(DateTime(timezone=True), server_default=func.now())
    status: str = Column(
        Enum("waiting", "offered", "transplanted", "withdrawn", name="recipient_status"),
        nullable=False,
        default="waiting",
    )
    registered_by: str = Column(
        UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True
    )
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: datetime = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    hospital = relationship("Hospital", back_populates="recipients")
    offers = relationship("Offer", back_populates="recipient")


class RuleVersion(Base):
    __tablename__ = "rule_version"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    organ: str = Column(String(50), nullable=False)
    version_tag: str = Column(String(50), nullable=False)
    weights_yaml_hash: str = Column(String(64), nullable=False)
    approved_by: str = Column(
        UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True
    )
    effective_from: datetime = Column(DateTime(timezone=True), nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("organ", "version_tag", name="uq_rule_version"),)

    match_runs = relationship("MatchRun", back_populates="rule_version")


class MatchRun(Base):
    __tablename__ = "match_run"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    donor_id: str = Column(
        UUID(as_uuid=False), ForeignKey("donor.id", ondelete="RESTRICT"), nullable=False
    )
    donor_code: str = Column(String(20), nullable=False)
    rule_version_id: str = Column(
        UUID(as_uuid=False), ForeignKey("rule_version.id", ondelete="RESTRICT"), nullable=False
    )
    result_json: dict = Column(JSON, nullable=False)
    run_by: str = Column(
        UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True
    )
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    donor = relationship("Donor", back_populates="match_runs")
    rule_version = relationship("RuleVersion", back_populates="match_runs")
    offers = relationship("Offer", back_populates="match_run")


class Offer(Base):
    __tablename__ = "offer"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    match_run_id: str = Column(
        UUID(as_uuid=False), ForeignKey("match_run.id", ondelete="RESTRICT"), nullable=False
    )
    recipient_id: str = Column(
        UUID(as_uuid=False), ForeignKey("recipient.id", ondelete="RESTRICT"), nullable=False
    )
    recipient_code: str = Column(String(20), nullable=False)
    rank: int = Column(Integer, nullable=False)
    status: str = Column(
        Enum(
            "pending", "accepted", "declined", "expired", "superseded",
            name="offer_status",
        ),
        nullable=False,
        default="pending",
    )
    expires_at: datetime = Column(DateTime(timezone=True), nullable=False)
    responded_at: Optional[datetime] = Column(DateTime(timezone=True), nullable=True)
    reason: Optional[str] = Column(Text, nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    match_run = relationship("MatchRun", back_populates="offers")
    recipient = relationship("Recipient", back_populates="offers")
    decisions = relationship("Decision", back_populates="offer")


class Decision(Base):
    __tablename__ = "decision"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    offer_id: str = Column(
        UUID(as_uuid=False), ForeignKey("offer.id", ondelete="RESTRICT"), nullable=False
    )
    committee_user_id: str = Column(
        UUID(as_uuid=False), ForeignKey("app_user.id", ondelete="SET NULL"), nullable=True
    )
    outcome: str = Column(
        Enum("approved", "rejected", "overridden", name="decision_outcome"), nullable=False
    )
    reason: str = Column(Text, nullable=False)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())

    offer = relationship("Offer", back_populates="decisions")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    time: datetime = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    actor_code: str = Column(String(50), nullable=False)
    action: str = Column(String(100), nullable=False)
    payload_hash: str = Column(String(64), nullable=False)
    prev_hash: str = Column(String(64), nullable=False)
    entry_hash: str = Column(String(64), nullable=False, unique=True)
    extra: dict = Column(JSON, nullable=False, default=dict)
