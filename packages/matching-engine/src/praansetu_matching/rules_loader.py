"""Rules loader: reads and validates versioned YAML rule files."""
from __future__ import annotations

import hashlib
import os
from functools import lru_cache
from typing import Any

import yaml

DEFAULT_WEIGHTS: dict[str, float] = {
    "urgency": 0.40,
    "hla": 0.30,
    "waiting_time": 0.20,
    "distance": 0.05,
    "pediatric": 0.05,
}

REQUIRED_WEIGHT_KEYS = set(DEFAULT_WEIGHTS.keys())


def _find_rules_dir() -> str:
    """Locate the rules directory from env or a sensible default."""
    rules_dir = os.environ.get("RULES_DIR", "")
    if not rules_dir:
        # Walk up from this file to find the package root
        here = os.path.dirname(os.path.abspath(__file__))
        rules_dir = os.path.join(here, "..", "..", "..", "rules")
    return os.path.abspath(rules_dir)


@lru_cache(maxsize=32)
def load_weights(organ: str, version_tag: str) -> dict[str, float]:
    """
    Load scoring weights for a given organ and version tag.
    Falls back to defaults if the YAML file is not found.
    """
    rules_dir = _find_rules_dir()
    yaml_path = os.path.join(rules_dir, organ, f"{version_tag}.yaml")

    if not os.path.exists(yaml_path):
        return DEFAULT_WEIGHTS.copy()

    with open(yaml_path, "r", encoding="utf-8") as f:
        data: dict[str, Any] = yaml.safe_load(f) or {}

    weights: dict[str, float] = data.get("weights", {})

    # Validate keys
    missing = REQUIRED_WEIGHT_KEYS - set(weights.keys())
    if missing:
        raise ValueError(f"Rule file {yaml_path} is missing weight keys: {missing}")

    # Validate that weights sum to approximately 1.0
    total = sum(weights.values())
    if abs(total - 1.0) > 0.01:
        raise ValueError(
            f"Rule file {yaml_path}: weights must sum to 1.0, got {total:.3f}"
        )

    return {k: float(v) for k, v in weights.items()}


def get_yaml_hash(organ: str, version_tag: str) -> str:
    """Return SHA-256 hash of the rule YAML file content."""
    rules_dir = _find_rules_dir()
    yaml_path = os.path.join(rules_dir, organ, f"{version_tag}.yaml")
    if not os.path.exists(yaml_path):
        return "0" * 64
    with open(yaml_path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()
