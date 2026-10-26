"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useOffers, useRespondOffer } from "@/hooks/use-offers";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { CountdownTimer } from "@/components/offer/countdown-timer";
import { OfferRespondDialog } from "@/components/offer/offer-respond-dialog";
import { Offer } from "@/lib/api-client";
import { formatDateTime } from "@/lib/formatters";
import { Clock, Filter, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function OffersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const { data, isLoading } = useOffers({
    page,
    page_size: 20,
    status: statusFilter || undefined,
  });

  const { mutateAsync: respondOffer } = useRespondOffer();

  const handleDialogSubmit = async (response: "accepted" | "declined", reason: string) => {
    if (!selectedOffer) return;
    await respondOffer({ id: selectedOffer.id, response, reason });
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Organ Offers & Window Timers
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time organ allocation offers under active countdown clocks. Primary candidates receive strict decision windows.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-white border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <Filter className="w-3.5 h-3.5" />
          <span>Status Filter:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs rounded border border-stone-300 py-1 px-2.5 bg-white text-stone-800"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending Response (Active Clocks)</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="expired">Expired</option>
          <option value="superseded">Superseded</option>
        </select>

        {statusFilter && (
          <button
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className="text-xs text-[#1e3a2f] hover:underline font-medium ml-auto"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Offers Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
          <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-2" />
          <p className="text-xs text-stone-500 font-mono">Loading organ offers...</p>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
          <Clock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="font-serif font-semibold text-stone-800 text-sm">No organ offers found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Offers are dispatched automatically when an allocation match is triggered for a donor organ.
          </p>
          <div className="mt-4">
            <Link href="/matches">
              <Button variant="secondary" size="sm">Go to Matches</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate Code</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Window Timer</TableHead>
                <TableHead>Offer Dispatched</TableHead>
                <TableHead>Clinical Note</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((offer) => {
                const isPending = offer.status === "pending";
                return (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <AnonCode code={offer.recipient_code} />
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                        #{offer.rank}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={offer.status} />
                    </TableCell>
                    <TableCell>
                      {isPending ? (
                        <CountdownTimer expiresAt={offer.expires_at} />
                      ) : (
                        <span className="text-xs font-mono text-stone-500">
                          {offer.responded_at ? formatDateTime(offer.responded_at) : "Window closed"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-stone-500 font-mono">
                      {formatDateTime(offer.created_at)}
                    </TableCell>
                    <TableCell className="text-xs text-stone-600 max-w-xs truncate">
                      {offer.reason || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setSelectedOffer(offer)}
                            className="text-xs h-7"
                          >
                            Respond
                          </Button>
                        ) : (
                          <Link href={`/offers/${offer.id}`}>
                            <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                              Details
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <div>
              Showing {data.items.length} of {data.total} offers
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

      {/* Offer Response Dialog */}
      <OfferRespondDialog
        open={Boolean(selectedOffer)}
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
}
