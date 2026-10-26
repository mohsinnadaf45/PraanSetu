"""Distance scorer: shorter distance = higher score."""
from __future__ import annotations

import math
from typing import Optional

from praansetu_matching.models import DonorInput, RecipientInput

MAX_DISTANCE_KM = 3000.0  # Normalization cap


def _haversine_km(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Calculate great-circle distance between two GPS points in kilometres."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def distance_score(donor: DonorInput, recipient: RecipientInput) -> float:
    """
    Return a 0.0–1.0 score where 1.0 means same location (0 km away)
    and 0.0 means >= MAX_DISTANCE_KM away.
    Returns 0.5 if coordinates are unknown (neutral, does not exclude).
    """
    donor_lat = donor.test_results.get("lat")
    donor_lon = donor.test_results.get("lon")
    r_lat = recipient.lat
    r_lon = recipient.lon

    if donor_lat is None or donor_lon is None or r_lat is None or r_lon is None:
        return 0.5  # Neutral when no location data

    dist_km = _haversine_km(float(donor_lat), float(donor_lon), r_lat, r_lon)
    return max(0.0, 1.0 - dist_km / MAX_DISTANCE_KM)
