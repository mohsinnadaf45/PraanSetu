"""Blood group compatibility filter."""
from __future__ import annotations

# ABO compatibility table: donor -> compatible recipient blood groups
ABO_COMPATIBLE: dict[str, set[str]] = {
    "O-":  {"O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"},
    "O+":  {"O+", "A+", "B+", "AB+"},
    "A-":  {"A-", "A+", "AB-", "AB+"},
    "A+":  {"A+", "AB+"},
    "B-":  {"B-", "B+", "AB-", "AB+"},
    "B+":  {"B+", "AB+"},
    "AB-": {"AB-", "AB+"},
    "AB+": {"AB+"},
}


def is_blood_group_compatible(donor_bg: str, recipient_bg: str) -> bool:
    """
    Return True if the donor's blood group can donate to the recipient.
    Follows standard ABO compatibility rules.
    """
    compatible_recipients = ABO_COMPATIBLE.get(donor_bg, set())
    return recipient_bg in compatible_recipients
