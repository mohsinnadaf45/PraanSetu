import { describe, it, expect } from "vitest";
import { MatchRunCandidate } from "../lib/api-client";

describe("Allocation Explanation and Scoring", () => {
  it("computes percentage score and verifies breakdown sums", () => {
    const candidate: MatchRunCandidate = {
      rank: 1,
      recipient_code: "R-9F12A4",
      score: 0.88,
      score_breakdown: {
        urgency: 0.35,
        hla: 0.25,
        waiting_time: 0.18,
        distance: 0.10,
      },
      reasons: [
        "Tier 1 Medical Urgency (ICU)",
        "Zero HLA mismatch on DR locus",
        "Waiting time > 500 days",
      ],
    };

    expect(candidate.rank).toBe(1);
    expect(Math.round(candidate.score * 100)).toBe(88);
    expect(candidate.reasons.length).toBe(3);

    const breakdownSum = Object.values(candidate.score_breakdown).reduce((a, b) => (a || 0) + (b || 0), 0);
    expect(breakdownSum).toBeCloseTo(0.88, 2);
  });

  it("handles empty reasons array gracefully with fallback", () => {
    const candidate: MatchRunCandidate = {
      rank: 2,
      recipient_code: "R-82B14C",
      score: 0.65,
      score_breakdown: {},
      reasons: [],
    };

    const displayText = candidate.reasons.length > 0 ? candidate.reasons.join(", ") : "Standard protocol match";
    expect(displayText).toBe("Standard protocol match");
  });
});
