"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Decision, Offer } from "@/lib/api-client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { formatDateTime } from "@/lib/formatters";
import { Users, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, FileSignature, AlertCircle } from "lucide-react";

export default function CommitteePage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [outcome, setOutcome] = useState<"approved" | "rejected" | "overridden">("approved");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fetch past decisions
  const { data: decisionsData, isLoading: isDecisionsLoading } = useQuery({
    queryKey: ["decisions", page],
    queryFn: () => api.decisions.list(page, 20),
  });

  // Fetch offers (to choose an offer to decide on)
  const { data: offersData } = useQuery({
    queryKey: ["offers", "for-committee"],
    queryFn: () => api.offers.list({ page: 1, page_size: 50 }),
  });

  // Create decision mutation
  const { mutateAsync: createDecision, isPending: isSubmitting } = useMutation({
    mutationFn: (body: { offer_id: string; outcome: "approved" | "rejected" | "overridden"; reason: string }) =>
      api.decisions.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      setSelectedOfferId("");
      setReason("");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferId) {
      setError("Please select an organ offer to review.");
      return;
    }
    if (!reason.trim()) {
      setError("A detailed justification is mandatory for committee decisions.");
      return;
    }
    setError(null);

    try {
      await createDecision({
        offer_id: selectedOfferId,
        outcome,
        reason,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to record committee decision.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Transplant Oversight & Ethics Committee
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Multidisciplinary medical board sign-off, clinical audits, and emergency protocol overrides.
          </p>
        </div>
      </div>

      {/* New Committee Sign-off Card */}
      <Card className="bg-canvas border-ink-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-accent" />
            <h2 className="font-serif font-bold text-ink text-sm">
              Record Committee Formal Determination
            </h2>
          </div>
          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
            Record clinical sign-off, consensus approval, or an emergency protocol override. Any override is permanently flagged in the hash-chained audit ledger for NOTTO review.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Select Offer Under Review
              </label>
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full text-xs rounded border border-stone-300 py-2 px-3 bg-white text-stone-900 shadow-2xs font-mono"
              >
                <option value="">-- Select an offer --</option>
                {offersData?.items?.map((o) => (
                  <option key={o.id} value={o.id}>
                    Offer {o.id.substring(0, 8)}: Candidate {o.recipient_code} (Rank #{o.rank}, {o.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Committee Decision Outcome
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as any)}
                className="w-full text-xs rounded border border-stone-300 py-2 px-3 bg-white text-stone-900 shadow-2xs font-medium"
              >
                <option value="approved">Approved (Consensus Clearance)</option>
                <option value="rejected">Rejected (Clinical Inadmissibility)</option>
                <option value="overridden">Overridden (Emergency / Exceptional)</option>
              </select>
            </div>
          </div>

          {outcome === "overridden" && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Notice of Override Logging</p>
                <p className="mt-0.5 text-stone-600">
                  Selecting &apos;Overridden&apos; flags this allocation in external auditor reports. You must provide extensive medical rationale below.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Consensus Review Notes & Rationale <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Record the consensus findings of the attending transplant surgeons, tissue typing laboratory, and ethics coordinator..."
              className="w-full text-xs rounded-md border border-ink-border bg-surface p-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-accent"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-status-redBg border border-status-redBorder rounded-md text-xs text-status-red flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-status-greenBg border border-status-greenBorder rounded-md text-xs text-status-green flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
              <span>Committee decision successfully committed and chained to audit trail.</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !selectedOfferId}
              className="gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? "Recording Decision..." : "Commit Committee Decision"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Decision Log Table */}
      <div className="space-y-3">
        <h2 className="font-serif font-bold text-base text-stone-900">
          Historical Committee Determinations
        </h2>

        {isDecisionsLoading ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
            <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-accent rounded-full animate-spin mb-2" />
            <p className="text-xs text-stone-500 font-mono">Loading decision records...</p>
          </div>
        ) : !decisionsData || decisionsData.items.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
            <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="font-serif font-semibold text-stone-800 text-sm">No committee decisions recorded yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              When organ offers are accepted or require oversight, decisions will be listed here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Decision ID</TableHead>
                  <TableHead>Offer ID</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Review Notes</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisionsData.items.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs text-stone-700">
                      {d.id.substring(0, 8)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-stone-700">
                      {d.offer_id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          d.outcome === "approved"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : d.outcome === "overridden"
                            ? "bg-amber-50 text-amber-900 border border-amber-300"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {d.outcome === "approved" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {d.outcome === "overridden" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {d.outcome === "rejected" && <XCircle className="w-3 h-3 text-rose-600" />}
                        {d.outcome.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-stone-700 max-w-md">
                      {d.reason}
                    </TableCell>
                    <TableCell className="text-xs text-stone-500 font-mono">
                      {formatDateTime(d.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <div>
                Showing {decisionsData.items.length} of {decisionsData.total} decisions
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
                  disabled={decisionsData.items.length < 20 || page * 20 >= decisionsData.total}
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
