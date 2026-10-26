/**
 * Shared domain types and enums for PraanSetu.
 * Matches ARCHITECTURE.md specifications.
 */

export type OrganType = "kidney" | "liver" | "heart" | "lung" | "pancreas";

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type UserRole =
  | "admin"
  | "doctor"
  | "coordinator"
  | "committee"
  | "auditor"
  | "authority";

export type DonorStatus = "available" | "matched" | "transplanted" | "withdrawn";

export type RecipientStatus =
  | "waiting"
  | "offered"
  | "transplanted"
  | "suspended"
  | "inactive";

export type OfferStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "superseded";

export type DecisionOutcome = "approved" | "overridden" | "rejected";

export interface ReasonItem {
  code: string;
  category: "blood_group" | "size" | "hla" | "urgency" | "waiting_time" | "distance" | "pediatric";
  score_contribution: number;
  description: string;
}

export interface RankedCandidate {
  recipient_code: string;
  rank: number;
  total_score: number;
  urgency_score: number;
  hla_score: number;
  waiting_time_score: number;
  distance_score: number;
  pediatric_score: number;
  hard_filter_passed: boolean;
  reasons: ReasonItem[];
}

export interface MatchResult {
  match_run_id: string;
  donor_code: string;
  organ: OrganType;
  rule_version_id: string;
  weights_yaml_hash: string;
  ranked_candidates: RankedCandidate[];
  total_evaluated: number;
  total_eligible: number;
  created_at: string;
}
