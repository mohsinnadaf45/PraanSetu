"""Pydantic v2 schemas for request/response shapes."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth ─────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class MFAVerifyRequest(BaseModel):
    mfa_pending_token: str
    totp_code: str = Field(min_length=6, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MFAPendingResponse(BaseModel):
    mfa_pending_token: str
    message: str = "MFA verification required"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Hospital ──────────────────────────────────────────────────

class HospitalCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    region: str = Field(min_length=2, max_length=100)


class HospitalUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    region: Optional[str] = Field(None, min_length=2, max_length=100)
    verified: Optional[bool] = None


class HospitalOut(BaseModel):
    id: str
    name: str
    region: str
    verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── User ─────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12)
    role: str
    hospital_id: Optional[str] = None

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"coordinator", "doctor", "committee", "auditor", "authority", "admin"}
        if v not in allowed:
            raise ValueError(f"Role must be one of {allowed}")
        return v


class UserUpdate(BaseModel):
    role: Optional[str] = None
    hospital_id: Optional[str] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: str
    email: str
    role: str
    hospital_id: Optional[str]
    mfa_enabled: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TOTPSetupResponse(BaseModel):
    totp_secret: str
    totp_uri: str


class TOTPEnableRequest(BaseModel):
    totp_code: str = Field(min_length=6, max_length=6)


# ── Donor ─────────────────────────────────────────────────────

class DonorCreate(BaseModel):
    organ: str
    blood_group: str
    size_kg: Optional[float] = None
    age_years: Optional[int] = None
    test_results: dict[str, Any] = Field(default_factory=dict)

    @field_validator("organ")
    @classmethod
    def validate_organ(cls, v: str) -> str:
        allowed = {"kidney", "liver", "heart", "lung", "pancreas"}
        if v not in allowed:
            raise ValueError(f"Organ must be one of {allowed}")
        return v

    @field_validator("blood_group")
    @classmethod
    def validate_blood_group(cls, v: str) -> str:
        allowed = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
        if v not in allowed:
            raise ValueError(f"Blood group must be one of {allowed}")
        return v


class DonorUpdate(BaseModel):
    status: Optional[str] = None
    test_results: Optional[dict[str, Any]] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"available", "matched", "transplanted", "withdrawn"}
        if v not in allowed:
            raise ValueError(f"Status must be one of {allowed}")
        return v


class DonorOut(BaseModel):
    id: str
    donor_code: str
    hospital_id: str
    organ: str
    blood_group: str
    size_kg: Optional[float]
    age_years: Optional[int]
    test_results: dict[str, Any]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Recipient ─────────────────────────────────────────────────

class RecipientCreate(BaseModel):
    organ: str
    blood_group: str
    size_kg: Optional[float] = None
    age_years: Optional[int] = None
    hla: dict[str, Any] = Field(default_factory=dict)
    urgency: int = Field(ge=1, le=5, default=1)

    @field_validator("organ")
    @classmethod
    def validate_organ(cls, v: str) -> str:
        allowed = {"kidney", "liver", "heart", "lung", "pancreas"}
        if v not in allowed:
            raise ValueError(f"Organ must be one of {allowed}")
        return v

    @field_validator("blood_group")
    @classmethod
    def validate_blood_group(cls, v: str) -> str:
        allowed = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}
        if v not in allowed:
            raise ValueError(f"Blood group must be one of {allowed}")
        return v


class RecipientUpdate(BaseModel):
    status: Optional[str] = None
    urgency: Optional[int] = Field(None, ge=1, le=5)
    hla: Optional[dict[str, Any]] = None


class RecipientOut(BaseModel):
    id: str
    recipient_code: str
    hospital_id: str
    organ: str
    blood_group: str
    size_kg: Optional[float]
    age_years: Optional[int]
    hla: dict[str, Any]
    urgency: int
    listed_at: datetime
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Match ─────────────────────────────────────────────────────

class MatchRunRequest(BaseModel):
    donor_code: str


class MatchResultItem(BaseModel):
    rank: int
    recipient_code: str
    score: float
    reasons: list[str]


class MatchRunOut(BaseModel):
    id: str
    donor_code: str
    rule_version_id: str
    result_json: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Offer ─────────────────────────────────────────────────────

class OfferRespondRequest(BaseModel):
    response: str  # "accepted" | "declined"
    reason: Optional[str] = None

    @field_validator("response")
    @classmethod
    def validate_response(cls, v: str) -> str:
        if v not in {"accepted", "declined"}:
            raise ValueError("Response must be 'accepted' or 'declined'")
        return v


class OfferOut(BaseModel):
    id: str
    match_run_id: str
    recipient_code: str
    rank: int
    status: str
    expires_at: datetime
    responded_at: Optional[datetime]
    reason: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Decision ──────────────────────────────────────────────────

class DecisionCreate(BaseModel):
    offer_id: str
    outcome: str
    reason: str = Field(min_length=5)

    @field_validator("outcome")
    @classmethod
    def validate_outcome(cls, v: str) -> str:
        if v not in {"approved", "rejected", "overridden"}:
            raise ValueError("Outcome must be 'approved', 'rejected', or 'overridden'")
        return v


class DecisionOut(BaseModel):
    id: str
    offer_id: str
    committee_user_id: Optional[str]
    outcome: str
    reason: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Identity / Vault ─────────────────────────────────────────

class IdentityStore(BaseModel):
    """Request to store identity for a code."""
    code: str
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    gov_id: Optional[str] = None


class RevealRequest(BaseModel):
    code: str
    reason: str = Field(min_length=10)


class RevealApproveRequest(BaseModel):
    reveal_id: str
    approved: bool
    note: Optional[str] = None


class IdentityOut(BaseModel):
    code: str
    name: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    gov_id: Optional[str]


class RevealOut(BaseModel):
    id: str
    code: str
    requested_by: str
    approved_by: Optional[str]
    reason: str
    status: str
    time: datetime

    model_config = {"from_attributes": True}


# ── Audit ─────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: str
    time: datetime
    actor_code: str
    action: str
    payload_hash: str
    prev_hash: str
    entry_hash: str
    extra: dict[str, Any]

    model_config = {"from_attributes": True}


class AuditVerifyResponse(BaseModel):
    valid: bool
    entries_checked: int
    first_bad_id: Optional[str] = None
    message: str


# ── Reports ───────────────────────────────────────────────────

class FairnessReportOut(BaseModel):
    period_start: datetime
    period_end: datetime
    total_match_runs: int
    total_offers: int
    offers_accepted: int
    offers_declined: int
    offers_expired: int
    median_waiting_days: float
    by_blood_group: dict[str, Any]
    by_organ: dict[str, Any]


# ── Admin ────────────────────────────────────────────────────

class RuleVersionCreate(BaseModel):
    organ: str
    version_tag: str
    weights_yaml_hash: str
    effective_from: datetime


class RuleVersionOut(BaseModel):
    id: str
    organ: str
    version_tag: str
    weights_yaml_hash: str
    approved_by: Optional[str]
    effective_from: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Pagination ────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[Any]
