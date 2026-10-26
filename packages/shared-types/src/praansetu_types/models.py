"""Shared domain models and data transfer contracts."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field

from .enums import BloodGroup, DecisionOutcome, DonorStatus, OfferStatus, OrganType, RecipientStatus, UserRole


class BaseAnonymousCode(BaseModel):
    code: str = Field(..., description="Anonymous identifier code (e.g. D-12345 or R-67890)")


class SharedDonorSummary(BaseModel):
    donor_code: str
    organ: OrganType
    blood_group: BloodGroup
    size_kg: Optional[float] = None
    age_years: Optional[int] = None
    status: DonorStatus
    created_at: datetime


class SharedRecipientSummary(BaseModel):
    recipient_code: str
    organ: OrganType
    blood_group: BloodGroup
    urgency: int = Field(ge=1, le=5)
    status: RecipientStatus
    listed_at: datetime
