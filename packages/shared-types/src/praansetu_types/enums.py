"""Shared domain enumerations for PraanSetu."""
from enum import Enum


class OrganType(str, Enum):
    KIDNEY = "kidney"
    LIVER = "liver"
    HEART = "heart"
    LUNG = "lung"
    PANCREAS = "pancreas"


class BloodGroup(str, Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    COORDINATOR = "coordinator"
    COMMITTEE = "committee"
    AUDITOR = "auditor"
    AUTHORITY = "authority"


class DonorStatus(str, Enum):
    AVAILABLE = "available"
    MATCHED = "matched"
    TRANSPLANTED = "transplanted"
    WITHDRAWN = "withdrawn"


class RecipientStatus(str, Enum):
    WAITING = "waiting"
    OFFERED = "offered"
    TRANSPLANTED = "transplanted"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"


class OfferStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"
    SUPERSEDED = "superseded"


class DecisionOutcome(str, Enum):
    APPROVED = "approved"
    OVERRIDDEN = "overridden"
    REJECTED = "rejected"
