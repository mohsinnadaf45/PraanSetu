"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOffer, useRespondOffer } from "@/hooks/use-offers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { CountdownTimer } from "@/components/offer/countdown-timer";
import { OfferRespondDialog } from "@/components/offer/offer-respond-dialog";
import { formatDateTime } from "@/lib/formatters";
import { ArrowLeft, Clock, GitCompare, CheckCircle2, XCircle, ShieldCheck, AlertCircle } from "lucide-react";

export default function OfferDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: offer, isLoading, error } = useOffer(id);
  const { mutateAsync: respondOffer } = useRespondOffer();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-16 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-3" />
        <p className="text-xs text-stone-500 font-mono">Loading offer #{id}...</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white border border-stone-200 rounded-lg">
        <h2 className="font-serif font-bold text-stone-900 text-base">Offer Not Found</h2>
        <p className="text-xs text-stone-500 mt-1 mb-4">
          The requested organ offer does not exist or has been archived.
        </p>
        <Link href="/offers">
          <Button variant="secondary" size="sm">Back to Offers</Button>
        </Link>
      </div>
    );
  }

  const isPending = offer.status === "pending";

  const handleDialogSubmit = async (response: "accepted" | "declined", reason: string) => {
    await respondOffer({ id: offer.id, response, reason });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <Link href="/offers">
            <Button variant="ghost" size="sm" className="p-1.5 h-8">
              <ArrowLeft className="w-4 h-4 text-stone-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
                Organ Allocation Offer
              </h1>
              <StatusChip status={offer.status} />
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Offer ID: <span className="font-mono">{offer.id}</span>
            </p>
          </div>
        </div>

        {isPending && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="gap-1.5"
          >
            Respond to Offer
          </Button>
        )}
      </div>

      {/* Countdown Card (if pending) */}
      {isPending && (
        <Card className="bg-amber-50/60 border-amber-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-700" />
                Active Acceptance Window
              </div>
              <p className="text-xs text-stone-600 mt-1">
                The transplant team must accept or decline before the window expires.
              </p>
            </div>
            <CountdownTimer expiresAt={offer.expires_at} />
          </div>
        </Card>
      )}

      {/* Offer Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-white">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Recipient Candidate
          </div>
          <div className="flex items-center gap-2 mb-2">
            <AnonCode code={offer.recipient_code} />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
              Rank #{offer.rank}
            </span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Offered strictly based on deterministic rank calculated by the NOTTO rule engine.
          </p>
        </Card>

        <Card className="bg-white">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Match Run Connection
          </div>
          <div className="text-xs font-mono text-stone-800 mb-2">
            Match #{offer.match_run_id?.substring(0, 8)}
          </div>
          <Link href={`/matches/${offer.match_run_id}`}>
            <Button variant="outline" size="sm" className="text-xs gap-1 w-full justify-center">
              <GitCompare className="w-3.5 h-3.5" />
              View Full Match Run
            </Button>
          </Link>
        </Card>
      </div>

      {/* Decision Audit Trail */}
      <Card className="bg-white">
        <h3 className="font-serif font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1e3a2f]" />
          Decision History & Audit Trail
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500">Offer Generated:</span>
            <span className="font-mono text-stone-800">{formatDateTime(offer.created_at)}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500">Expiration Threshold:</span>
            <span className="font-mono text-stone-800">{formatDateTime(offer.expires_at)}</span>
          </div>

          {offer.responded_at && (
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-stone-500">Responded At:</span>
              <span className="font-mono text-stone-800">{formatDateTime(offer.responded_at)}</span>
            </div>
          )}

          <div>
            <span className="text-stone-500 block mb-1">Clinical Justification:</span>
            <div className="p-3 bg-stone-50 rounded border border-stone-200 text-stone-700 italic">
              {offer.reason || "No clinical note recorded."}
            </div>
          </div>
        </div>
      </Card>

      {/* Dialog for responding */}
      <OfferRespondDialog
        open={isDialogOpen}
        offer={offer}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
}
