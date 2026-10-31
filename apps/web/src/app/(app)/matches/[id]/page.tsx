"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMatch } from "@/hooks/use-matches";
import { useDonors } from "@/hooks/use-donors";
import { RankedTable } from "@/components/match/ranked-table";
import { AnonCode } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/formatters";
import { ArrowLeft, GitCompare, ShieldCheck, FilterX, Clock, FileText } from "lucide-react";

export default function MatchDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: match, isLoading, error } = useMatch(id);
  const { data: donorData } = useDonors();

  if (isLoading) {
    return (
      <div className="p-16 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-accent rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-500 font-mono">Loading match run #{id}...</p>
      </div>

    );
  }

  if (error || !match) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white border border-stone-200 rounded-lg">
        <h2 className="font-serif font-bold text-stone-900 text-base">Match Run Not Found</h2>
        <p className="text-xs text-stone-500 mt-1 mb-4">
          The requested allocation run does not exist or you do not have permission to review it.
        </p>
        <Link href="/matches">
          <Button variant="secondary" size="sm">Back to Matches</Button>
        </Link>
      </div>
    );
  }

  const rankedCandidates = match.result_json?.ranked || [];
  const filteredOut = match.result_json?.filtered_out || [];
  const filterReasons = match.result_json?.filter_reasons || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="p-1.5 h-8">
              <ArrowLeft className="w-4 h-4 text-stone-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
                Allocation Run Details
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                ID: {match.id.substring(0, 8)}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Deterministic allocation calculation audited against rule version {match.rule_version_id}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/offers">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Clock className="w-4 h-4" />
              View Organ Offers
            </Button>
          </Link>
        </div>
      </div>

      {/* Donor & Algorithm Parameters Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Donor Code
          </div>
          <div className="flex items-center gap-2">
            <AnonCode code={match.donor_code} />
          </div>
          <div className="text-[11px] text-stone-400 mt-2 font-mono">
            Identity locked in vault
          </div>
        </Card>

        <Card className="bg-white">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Rule Version
          </div>
          <div className="text-sm font-bold text-stone-900 font-mono">
            {match.rule_version_id || "kidney/v1"}
          </div>
          <div className="text-[11px] text-stone-400 mt-2">
            Approved NOTTO protocol
          </div>
        </Card>

        <Card className="bg-white">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Allocation Output
          </div>
          <div className="text-sm font-bold text-stone-900">
            {rankedCandidates.length} Ranked / {filteredOut.length} Filtered
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Deterministic Result
          </div>
        </Card>

        <Card className="bg-white">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
            Timestamp
          </div>
          <div className="text-xs font-mono font-medium text-stone-800">
            {formatDateTime(match.created_at)}
          </div>
          <div className="text-[11px] text-stone-400 mt-2 font-mono">
            Hash chained in audit log
          </div>
        </Card>
      </div>

      {/* Ranked Candidate List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Ranked Recipient Candidates
            </h2>
            <p className="text-xs text-stone-500">
              Scored deterministically using clinical urgency, HLA histocompatibility, waiting time, and pediatric status.
            </p>
          </div>
        </div>

        <RankedTable
          candidates={rankedCandidates}
          ruleVersionTag={match.rule_version_id}
        />
      </div>

      {/* Filtered Out Candidates */}
      {filteredOut.length > 0 && (
        <Card className="bg-stone-50/70 border-stone-200">
          <div className="flex items-center gap-2 mb-3">
            <FilterX className="w-4 h-4 text-stone-500" />
            <h3 className="font-serif font-semibold text-stone-900 text-sm">
              Incompatible Candidates Excluded by Hard Filters ({filteredOut.length})
            </h3>
          </div>
          <p className="text-xs text-stone-500 mb-3">
            Candidates who did not pass absolute clinical constraints (blood group compatibility, positive virtual crossmatch, or anatomical size mismatch).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {filteredOut.map((code) => {
              const reason = filterReasons[code] || "Clinical hard filter exclusion";
              return (
                <div
                  key={code}
                  className="p-2.5 rounded bg-white border border-stone-200 text-xs flex items-center justify-between"
                >
                  <AnonCode code={code} />
                  <span className="text-[11px] text-stone-500 font-mono truncate max-w-[160px]" title={reason}>
                    {reason}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
