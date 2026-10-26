"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRecipients } from "@/hooks/use-recipients";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { IdentityRevealModal } from "@/components/identity/identity-reveal-modal";
import { formatDateTime, formatOrganName, getUrgencyInfo } from "@/lib/formatters";
import { UserPlus, Filter, Eye, ShieldAlert, HeartPulse } from "lucide-react";

export default function RecipientsPage() {
  const [organFilter, setOrganFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [revealCode, setRevealCode] = useState<string | null>(null);

  const { data, isLoading } = useRecipients({
    page,
    page_size: 20,
    organ: organFilter || undefined,
    status: statusFilter || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Recipient Waitlist Registry
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Active organ transplant candidates sorted strictly by clinical compatibility and medical urgency. Identity protected under Dual-Custody Vault.
          </p>
        </div>
        <Link href="/recipients/new">
          <Button variant="primary" size="sm" className="gap-1.5">
            <UserPlus className="w-4 h-4" />
            Register Waitlist Candidate
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-white border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        <select
          value={organFilter}
          onChange={(e) => {
            setOrganFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs rounded border border-stone-300 py-1 px-2.5 bg-white text-stone-800"
        >
          <option value="">All Organs</option>
          <option value="kidney">Kidney</option>
          <option value="liver">Liver</option>
          <option value="heart">Heart</option>
          <option value="lung">Lung</option>
          <option value="pancreas">Pancreas</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs rounded border border-stone-300 py-1 px-2.5 bg-white text-stone-800"
        >
          <option value="">All Statuses</option>
          <option value="waiting">Waiting</option>
          <option value="offered">Offered</option>
          <option value="transplanted">Transplanted</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="suspended">Suspended</option>
        </select>

        {(organFilter || statusFilter) && (
          <button
            onClick={() => {
              setOrganFilter("");
              setStatusFilter("");
              setPage(1);
            }}
            className="text-xs text-[#1e3a2f] hover:underline font-medium ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Recipients Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
          <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-2" />
          <p className="text-xs text-stone-500 font-mono">Loading recipient waitlist...</p>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
          <HeartPulse className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="font-serif font-semibold text-stone-800 text-sm">No waitlist recipients found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            There are currently no transplant candidates registered matching the selected criteria.
          </p>
          <div className="mt-4">
            <Link href="/recipients/new">
              <Button variant="secondary" size="sm">Register First Candidate</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient Code</TableHead>
                <TableHead>Organ</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Urgency Tier</TableHead>
                <TableHead>HLA Profile</TableHead>
                <TableHead>Size / Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waitlist Date</TableHead>
                <TableHead className="text-right">Dual Custody</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((r) => {
                const urgencyInfo = getUrgencyInfo(r.urgency);
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <AnonCode code={r.recipient_code} />
                    </TableCell>
                    <TableCell className="font-medium text-stone-900">
                      {formatOrganName(r.organ)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                        {r.blood_group}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${urgencyInfo.badgeClass}`}>
                          {urgencyInfo.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-mono text-stone-600 space-y-0.5">
                        <div>
                          <span className="text-stone-400">A:</span> {r.hla?.A?.join(", ") || "—"}
                        </div>
                        <div>
                          <span className="text-stone-400">B:</span> {r.hla?.B?.join(", ") || "—"}
                        </div>
                        <div>
                          <span className="text-stone-400">DR:</span> {r.hla?.DR?.join(", ") || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-stone-600 font-mono">
                      {r.size_kg ? `${r.size_kg} kg` : "—"} / {r.age_years ? `${r.age_years} yrs` : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={r.status} />
                    </TableCell>
                    <TableCell className="text-xs text-stone-500 font-mono">
                      {formatDateTime(r.listed_at || r.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRevealCode(r.recipient_code)}
                        className="text-stone-600 hover:text-stone-900 text-xs gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <Eye className="w-3.5 h-3.5" />
                        Reveal
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <div>
              Showing {data.items.length} of {data.total} candidates
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

      {/* Dual Custody Reveal Modal */}
      {revealCode && (
        <IdentityRevealModal
          open={Boolean(revealCode)}
          code={revealCode}
          onClose={() => setRevealCode(null)}
        />
      )}
    </div>
  );
}
