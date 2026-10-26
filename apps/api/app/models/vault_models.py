"""Vault SQLAlchemy models (separate database)."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import VaultBase


def _uuid() -> str:
    return str(uuid.uuid4())


class Identity(VaultBase):
    __tablename__ = "identity"

    code: str = Column(String(20), primary_key=True)  # Anonymous code (donor_code or recipient_code)
    name_enc: Optional[str] = Column(Text, nullable=True)
    phone_enc: Optional[str] = Column(Text, nullable=True)
    address_enc: Optional[str] = Column(Text, nullable=True)
    gov_id_enc: Optional[str] = Column(Text, nullable=True)
    created_at: datetime = Column(DateTime(timezone=True), server_default=func.now())
    updated_at: datetime = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    reveals = relationship("IdentityReveal", back_populates="identity")


class IdentityReveal(VaultBase):
    __tablename__ = "identity_reveal"

    id: str = Column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    code: str = Column(
        String(20), ForeignKey("identity.code", ondelete="CASCADE"), nullable=False, index=True
    )
    requested_by: str = Column(String(50), nullable=False)  # actor code
    approved_by: Optional[str] = Column(String(50), nullable=True)  # actor code
    reason: str = Column(Text, nullable=False)
    status: str = Column(
        String(20), nullable=False, default="pending"
    )  # pending | approved | rejected
    time: datetime = Column(DateTime(timezone=True), server_default=func.now())

    identity = relationship("Identity", back_populates="reveals")
