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
      <div className="w-full overflow-x-auto rounded-lg border border-stone-200/90 bg-white shadow-subtle">
        <table className="w-full text-left text-sm text-stone-900 border-collapse">
          <thead className="border-b border-stone-200 bg-[#fbfbf9] text-xs font-semibold uppercase tracking-wider text-stone-600">
            <tr>
              <th className="px-4 py-3 w-16 text-center">Rank</th>
              <th className="px-4 py-3">Recipient Code</th>
              <th className="px-4 py-3">Total Score</th>
              <th className="px-4 py-3">Key Reasons</th>
              <th className="px-4 py-3 text-right">Decision Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-sans">
            {candidates.map((c) => {
              const scorePct = Math.round(c.score * 100);
              const isTop = c.rank === 1;

              return (
                <tr
                  key={c.recipient_code}
                  className={`hover:bg-stone-50/70 transition-colors ${
                    isTop ? "bg-[#fbfcf9]" : ""
                  }`}
                >
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        isTop
                          ? "bg-[#1e3a2f] text-white shadow-xs"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      #{c.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <AnonCode code={c.recipient_code} />
                      {isTop && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Primary Candidate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-stone-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#1e3a2f] h-2 rounded-full"
                          style={{ width: `${Math.min(scorePct, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {scorePct}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-stone-600 max-w-md truncate">
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
