"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDonors } from "@/hooks/use-donors";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { IdentityRevealModal } from "@/components/identity/identity-reveal-modal";
import { formatDateTime, formatOrganName } from "@/lib/formatters";
import { PlusCircle, GitCompare, Filter, Eye, ShieldAlert } from "lucide-react";

export default function DonorsPage() {
  const [organFilter, setOrganFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [revealCode, setRevealCode] = useState<string | null>(null);

  const { data, isLoading } = useDonors({
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
            Organ Donors Registry
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registered organ donations with clinical parameters and compatibility attributes. Real identity locked in vault.
          </p>
        </div>
        <Link href="/donors/new">
          <Button variant="primary" size="sm" className="gap-1.5">
            <PlusCircle className="w-4 h-4" />
            List New Donor Organ
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
          <option value="available">Available</option>
          <option value="matched">Matched</option>
          <option value="transplanted">Transplanted</option>
          <option value="withdrawn">Withdrawn</option>
        </select>

        {(organFilter || statusFilter) && (
          <button
            onClick={() => {
              setOrganFilter("");
              setStatusFilter("");
              setPage(1);
            }}
            className="text-xs text-accent hover:underline font-medium ml-auto"
          >
            Clear Filters
          </button>

        )}
      </div>

      {/* Donors Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-lg border border-stone-200">
          Loading donors registry...
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-lg border border-dashed border-stone-300">
          <p className="text-sm font-semibold text-stone-800">No donor records found</p>
          <p className="text-xs text-stone-500 mt-1">Try adjusting the filter criteria or register a new donor.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Donor Code</TableHead>
              <TableHead>Organ</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Body Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {data.items.map((donor) => (
              <TableRow key={donor.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <AnonCode code={donor.donor_code} />
                    <button
                      onClick={() => setRevealCode(donor.donor_code)}
                      className="p-1 rounded text-stone-400 hover:text-amber-700 hover:bg-amber-50"
                      title="Request Identity Decryption (Authorized Emergency Use Only)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-xs text-stone-900">
                  {formatOrganName(donor.organ)}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                    {donor.blood_group}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-stone-600">
                  {donor.size_kg ? `${donor.size_kg} kg` : "—"}{" "}
                  {donor.age_years ? `(${donor.age_years} yrs)` : ""}
                </TableCell>
                <TableCell>
                  <StatusChip status={donor.status} />
                </TableCell>
                <TableCell className="text-xs text-stone-500">
                  {formatDateTime(donor.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  {donor.status === "available" ? (
                    <Link href={`/matches?donor_code=${donor.donor_code}`}>
                      <Button variant="primary" size="sm" className="h-7 text-xs gap-1">
                        <GitCompare className="w-3.5 h-3.5" />
                        Run Match
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-stone-400 italic">Allocation closed</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Identity Reveal Modal */}
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
