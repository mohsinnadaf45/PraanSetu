"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMatches, useRunMatch } from "@/hooks/use-matches";
import { useDonors } from "@/hooks/use-donors";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatDateTime } from "@/lib/formatters";
import { GitCompare, Play, AlertCircle, ArrowRight, CheckCircle2, History } from "lucide-react";

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDonorCode = searchParams.get("donor_code") || "";

  const [selectedDonorCode, setSelectedDonorCode] = useState(initialDonorCode);
  const [page, setPage] = useState(1);
  const [runError, setRunError] = useState<string | null>(null);

  const { data: matchesData, isLoading: isMatchesLoading } = useMatches(page, 20);
  const { data: availableDonors } = useDonors({ status: "available" });
  const { mutateAsync: runMatch, isPending: isRunning } = useRunMatch();

  useEffect(() => {
    if (initialDonorCode) {
      setSelectedDonorCode(initialDonorCode);
    }
  }, [initialDonorCode]);

  const handleRunMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorCode) return;
    setRunError(null);

    try {
      const match = await runMatch(selectedDonorCode);
      router.push(`/matches/${match.id}`);
    } catch (err: any) {
      setRunError(err?.message || "Failed to execute matching engine on this donor.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Matching Engine Runs
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Deterministic, rule-based organ matching runs and candidate ranking audits.
          </p>
        </div>
      </div>

      {/* Trigger Match Card */}
      <Card className="bg-[#fbfbf9] border-stone-300">
        <form onSubmit={handleRunMatch} className="space-y-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#1e3a2f]" />
            <h2 className="font-serif font-bold text-stone-900 text-sm">
              Execute New Clinical Match Run
            </h2>
          </div>
          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
            Select an available donor organ to execute the deterministic filter and scoring algorithm against all active waitlist recipients. An immutable audit record will be chained instantly upon execution.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Select Available Donor Organ
              </label>
              {availableDonors?.items && availableDonors.items.length > 0 ? (
                <select
                  value={selectedDonorCode}
                  onChange={(e) => setSelectedDonorCode(e.target.value)}
                  className="w-full text-xs rounded border border-stone-300 py-2 px-3 bg-white text-stone-900 font-mono shadow-2xs focus:ring-1 focus:ring-[#1e3a2f]"
                >
                  <option value="">-- Choose an available donor code --</option>
                  {availableDonors.items.map((d) => (
                    <option key={d.donor_code} value={d.donor_code}>
                      {d.donor_code} ({d.organ.toUpperCase()}, {d.blood_group})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. D-A8F21B"
                  value={selectedDonorCode}
                  onChange={(e) => setSelectedDonorCode(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono uppercase rounded border border-stone-300 py-2 px-3 bg-white text-stone-900"
                />
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isRunning || !selectedDonorCode}
              className="gap-2 sm:self-end"
            >
              <Play className="w-4 h-4 fill-current" />
              {isRunning ? "Running Algorithm..." : "Execute Matching"}
            </Button>
          </div>

          {runError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{runError}</span>
            </div>
          )}
        </form>
      </Card>

      {/* Match Runs History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-stone-800">
          <History className="w-4 h-4 text-stone-500" />
          <h2 className="font-serif font-bold text-base">Match History & Audit Records</h2>
        </div>

        {isMatchesLoading ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
            <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-2" />
            <p className="text-xs text-stone-500 font-mono">Loading match run logs...</p>
          </div>
        ) : !matchesData || matchesData.items.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
            <GitCompare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="font-serif font-semibold text-stone-800 text-sm">No match runs executed yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              Select an available donor above to run the deterministic allocation engine and generate offers.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor Code</TableHead>
                  <TableHead>Rule Version</TableHead>
                  <TableHead>Ranked Candidates</TableHead>
                  <TableHead>Filtered Out</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchesData.items.map((m) => {
                  const rankedCount = m.result_json?.ranked?.length || 0;
                  const filteredCount = m.result_json?.filtered_out?.length || 0;
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <AnonCode code={m.donor_code} />
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                          {m.rule_version_id || "kidney/v1"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-stone-900">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {rankedCount} candidate{rankedCount !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-stone-500 font-mono">
                        {filteredCount} excluded
                      </TableCell>
                      <TableCell className="text-xs text-stone-500 font-mono">
                        {formatDateTime(m.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/matches/${m.id}`}>
                          <Button variant="outline" size="sm" className="text-xs gap-1">
                            <span>Review Allocation</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div>
                Showing {matchesData.items.length} of {matchesData.total} runs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={matchesData.items.length < 20 || page * 20 >= matchesData.total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500 font-mono">Loading matches...</div>}>
      <MatchesContent />
    </Suspense>
  );
}
