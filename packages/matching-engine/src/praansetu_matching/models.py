"""Data models for the matching engine (no database, pure Python)."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class DonorInput(BaseModel):
    """Anonymous donor data passed to the engine."""
    donor_code: str
    organ: str
    blood_group: str
    size_kg: Optional[float] = None
    age_years: Optional[int] = None
    test_results: dict[str, Any] = Field(default_factory=dict)


class RecipientInput(BaseModel):
    """Anonymous recipient data passed to the engine."""
    recipient_code: str
    organ: str
    blood_group: str
    size_kg: Optional[float] = None
    age_years: Optional[int] = None
    hla: dict[str, Any] = Field(default_factory=dict)
    urgency: int = Field(ge=1, le=5, default=1)
    listed_at: datetime = Field(default_factory=lambda: datetime.utcnow())

    # Optional: GPS coordinates for distance scoring
    lat: Optional[float] = None
    lon: Optional[float] = None


class RankedCandidate(BaseModel):
    """One candidate in the ranked output."""
    rank: int
    recipient_code: str
    score: float  # 0.0 – 1.0
    reasons: list[str]
    score_breakdown: dict[str, float] = Field(default_factory=dict)


class MatchingResult(BaseModel):
    """Full output of a matching run."""
    donor_code: str
    rule_version: str
    ranked: list[RankedCandidate]
    filtered_out: list[str]  # Recipient codes excluded by hard filters, with reasons
    filter_reasons: dict[str, str] = Field(default_factory=dict)
