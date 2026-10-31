"use client";

import React, { useState } from "react";
import { MatchRunCandidate } from "@/lib/api-client";
import { AnonCode } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WhyThisRankPanel } from "./why-this-rank";
import { HelpCircle, CheckCircle2 } from "lucide-react";

export interface RankedTableProps {
  candidates: MatchRunCandidate[];
  ruleVersionTag?: string;
  onSelectCandidate?: (candidate: MatchRunCandidate) => void;
}

export function RankedTable({
  candidates,
  ruleVersionTag = "v1",
  onSelectCandidate,
}: RankedTableProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<MatchRunCandidate | null>(null);

  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-stone-300 rounded-lg bg-stone-50">
        <p className="text-sm text-stone-600 font-medium">No candidates met the clinical hard filters for this donor.</p>
        <p className="text-xs text-stone-400 mt-1">Review size differences, ABO blood group, or crossmatch parameters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-md border border-ink-border bg-surface">
        <table className="w-full text-left text-sm text-ink border-collapse font-sans">
          <thead className="border-b border-ink-border bg-canvas text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            <tr>
              <th className="px-4 py-3 w-16 text-center">Rank</th>
              <th className="px-4 py-3">Recipient Code</th>
              <th className="px-4 py-3">Total Score</th>
              <th className="px-4 py-3">Key Reasons</th>
              <th className="px-4 py-3 text-right">Decision Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-border font-sans">
            {candidates.map((c) => {
              const scorePct = Math.round(c.score * 100);
              const isTop = c.rank === 1;

              return (
                <tr
                  key={c.recipient_code}
                  className={`hover:bg-canvas/60 transition-colors ${
                    isTop ? "bg-canvas/30" : ""
                  }`}
                >
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        isTop
                          ? "bg-accent text-white"
                          : "bg-canvas text-ink-secondary border border-ink-border"
                      }`}
                    >
                      #{c.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <AnonCode code={c.recipient_code} />
                      {isTop && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-status-green bg-status-greenBg px-2 py-0.5 rounded-md border border-status-greenBorder">
                          <CheckCircle2 className="w-3 h-3 text-status-green" /> Primary Candidate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-canvas border border-ink-border rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${Math.min(scorePct, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs text-ink">
                        {scorePct}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-ink-secondary max-w-md truncate">

                    {c.reasons && c.reasons.length > 0
                      ? c.reasons.join(" • ")
                      : "Matched according to standard protocol."}
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCandidate(c)}
                      className="text-xs h-7 gap-1 text-stone-700"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                      Why this rank?
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Slide-over explanation panel */}
      {selectedCandidate && (
        <WhyThisRankPanel
          candidate={selectedCandidate}
          ruleVersionTag={ruleVersionTag}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </>
  );
}
