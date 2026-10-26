"use client";

import React, { useState } from "react";
import { useAuditLogs } from "@/hooks/use-audit";
import { AuditLogTable } from "@/components/audit/audit-log-table";
import { VerifyAuditButton } from "@/components/audit/verify-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Filter, Lock, History } from "lucide-react";

export default function AuditPage() {
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAuditLogs({
    page,
    page_size: 20,
    action: actionFilter || undefined,
    actor_code: actorFilter || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Verification */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Cryptographic Audit Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Tamper-evident, append-only hash chain linking every allocation, offer, and clinical decision via SHA-256.
          </p>
        </div>
        <VerifyAuditButton />
      </div>

      {/* Chain Explanation Notice */}
      <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
        <Lock className="w-4 h-4 text-[#1e3a2f] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-stone-900">Cryptographic Invariant:</span> Every log entry computes{" "}
          <code className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-800">
            entry_hash = SHA-256(prev_hash + payload_hash + timestamp)
          </code>
          . Any retroactive database modification breaks the chain immediately and halts system verification.
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-white border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs rounded border border-stone-300 py-1 px-2.5 bg-white text-stone-800"
        >
          <option value="">All Actions</option>
          <option value="donor.create">donor.create</option>
          <option value="recipient.create">recipient.create</option>
          <option value="match.run">match.run</option>
          <option value="offer.create">offer.create</option>
          <option value="offer.respond">offer.respond</option>
          <option value="decision.create">decision.create</option>
          <option value="identity.reveal">identity.reveal</option>
        </select>

        <input
          type="text"
          placeholder="Filter by Actor Code (e.g. U-ADM01)"
          value={actorFilter}
          onChange={(e) => {
            setActorFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs rounded border border-stone-300 py-1 px-2.5 bg-white text-stone-800 font-mono w-56"
        />

        {(actionFilter || actorFilter) && (
          <button
            onClick={() => {
              setActionFilter("");
              setActorFilter("");
              setPage(1);
            }}
            className="text-xs text-[#1e3a2f] hover:underline font-medium ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
          <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-2" />
          <p className="text-xs text-stone-500 font-mono">Loading tamper-evident ledger...</p>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
          <History className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="font-serif font-semibold text-stone-800 text-sm">No audit entries found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            System actions will automatically be appended and hash-chained here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
          <AuditLogTable entries={data.items} />

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <div>
              Showing {data.items.length} of {data.total} audit entries
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
                disabled={data.items.length < 20 || page * 20 >= data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
