"use client";

import React from "react";
import { MatchRunCandidate } from "@/lib/api-client";
import { AnonCode } from "@/components/ui/badge";
import { X, Award, Activity, Heart, Clock, Navigation, UserCheck } from "lucide-react";

export interface WhyThisRankProps {
  candidate: MatchRunCandidate | null;
  ruleVersionTag?: string;
  onClose: () => void;
}

export function WhyThisRankPanel({
  candidate,
  ruleVersionTag = "v1",
  onClose,
}: WhyThisRankProps) {
  if (!candidate) return null;

  const b = candidate.score_breakdown || {};

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-ink-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-ink-border flex items-start justify-between bg-canvas">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Ranking Explanation
            </span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-canvas border border-ink-border text-ink-secondary">
              Rule {ruleVersionTag}
            </span>
          </div>
          <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
            Rank #{candidate.rank}: <AnonCode code={candidate.recipient_code} />
          </h2>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-ink-secondary hover:text-ink hover:bg-canvas transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Total Score Summary Card */}
        <div className="p-4 rounded-md bg-accent-light border border-accent-border flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wider">
              Total Medical Match Score
            </p>
            <p className="font-serif text-3xl font-bold text-accent-hover">
              {(candidate.score * 100).toFixed(1)} / 100
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface border border-accent-border flex items-center justify-center text-accent">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Plain Language Reasons */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-3">
            Clinical Decision Factors
          </h3>
          <div className="space-y-2">
            {candidate.reasons && candidate.reasons.length > 0 ? (
              candidate.reasons.map((reason, i) => (
                <div
                  key={i}
                  className="p-3 rounded-md border border-ink-border bg-canvas/40 text-sm text-ink leading-snug flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-ink-secondary italic">No specific override notes recorded.</p>
            )}
          </div>
        </div>

        {/* Detailed Breakdown Weights */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-3">
            Algorithmic Score Contributions
          </h3>
          <div className="space-y-3 font-mono text-xs">
            {/* Urgency */}
            <div className="flex items-center justify-between p-2.5 rounded bg-stone-50 border border-stone-200">
              <span className="flex items-center gap-2 text-stone-700 font-sans text-sm">
                <Activity className="w-4 h-4 text-red-600" /> Medical Urgency
              </span>
              <span className="font-bold text-stone-900">
                {b.urgency !== undefined ? `${(b.urgency * 100).toFixed(0)}%` : "—"}
              </span>
            </div>

            {/* Tissue HLA */}
            <div className="flex items-center justify-between p-2.5 rounded bg-stone-50 border border-stone-200">
              <span className="flex items-center gap-2 text-stone-700 font-sans text-sm">
                <Heart className="w-4 h-4 text-rose-600" /> Tissue Match (HLA)
              </span>
              <span className="font-bold text-stone-900">
                {b.hla !== undefined ? `${(b.hla * 100).toFixed(0)}%` : "—"}
              </span>
            </div>

            {/* Waiting Time */}
            <div className="flex items-center justify-between p-2.5 rounded bg-stone-50 border border-stone-200">
              <span className="flex items-center gap-2 text-stone-700 font-sans text-sm">
                <Clock className="w-4 h-4 text-blue-600" /> Accrued Waiting Time
              </span>
              <span className="font-bold text-stone-900">
                {b.waiting_time !== undefined ? `${(b.waiting_time * 100).toFixed(0)}%` : "—"}
              </span>
            </div>

            {/* Distance */}
            <div className="flex items-center justify-between p-2.5 rounded bg-stone-50 border border-stone-200">
              <span className="flex items-center gap-2 text-stone-700 font-sans text-sm">
                <Navigation className="w-4 h-4 text-amber-600" /> Geographic Distance
              </span>
              <span className="font-bold text-stone-900">
                {b.distance !== undefined ? `${(b.distance * 100).toFixed(0)}%` : "—"}
              </span>
            </div>

            {/* Pediatric */}
            <div className="flex items-center justify-between p-2.5 rounded bg-stone-50 border border-stone-200">
              <span className="flex items-center gap-2 text-stone-700 font-sans text-sm">
                <UserCheck className="w-4 h-4 text-emerald-600" /> Pediatric Priority
              </span>
              <span className="font-bold text-stone-900">
                {b.pediatric !== undefined ? `${(b.pediatric * 100).toFixed(0)}%` : "0%"}
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory footer */}
        <div className="p-3 rounded bg-stone-100 text-xs text-stone-600 border border-stone-200">
          <p className="font-semibold text-stone-800">Decision Support Notice</p>
          <p className="mt-0.5">
            This ranking is calculated deterministically per approved NOTTO-aligned allocation
            rules. The attending transplant team retains ultimate clinical authority.
          </p>
        </div>
      </div>
    </div>
  );
}
