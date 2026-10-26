"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { Offer } from "@/lib/api-client";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export interface OfferRespondDialogProps {
  open: boolean;
  offer: Offer | null;
  onClose: () => void;
  onSubmit: (response: "accepted" | "declined", reason: string) => Promise<void>;
}

export function OfferRespondDialog({
  open,
  offer,
  onClose,
  onSubmit,
}: OfferRespondDialogProps) {
  const [action, setAction] = useState<"accepted" | "declined">("accepted");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!offer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("A written clinical justification is mandatory for auditing and NOTTO reporting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(action, reason);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to submit response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Organ Offer Response"
      description={`Official clinical decision for candidate ${offer.recipient_code} (Rank #${offer.rank})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-[#fbfbf9] rounded border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
          <span>Candidate Code:</span>
          <AnonCode code={offer.recipient_code} />
        </div>

        {/* Action Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAction("accepted")}
            className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
              action === "accepted"
                ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-600"
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            <CheckCircle2
              className={`w-5 h-5 mt-0.5 ${
                action === "accepted" ? "text-emerald-700" : "text-stone-400"
              }`}
            />
            <div>
              <p className="text-sm font-semibold">Accept Organ</p>
              <p className="text-xs text-stone-500">Patient consented & surgical team ready</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAction("declined")}
            className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
              action === "declined"
                ? "border-rose-600 bg-rose-50/70 text-rose-950 ring-1 ring-rose-600"
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            <XCircle
              className={`w-5 h-5 mt-0.5 ${
                action === "declined" ? "text-rose-700" : "text-stone-400"
              }`}
            />
            <div>
              <p className="text-sm font-semibold">Decline Offer</p>
              <p className="text-xs text-stone-500">Pass to next waitlist candidate</p>
            </div>
          </button>
        </div>

        {/* Written Justification */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            Clinical Justification & Notes <span className="text-red-600">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={
              action === "accepted"
                ? "e.g., Patient clinically cleared, crossmatch confirmed negative, theatre standby scheduled."
                : "e.g., Active bacteremia, patient temporarily medically unfit, hemodynamically unstable."
            }
            className="w-full text-sm rounded-md border border-stone-300 p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1e3a2f]"
            required
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={action === "accepted" ? "primary" : "destructive"}
            isLoading={isSubmitting}
          >
            {action === "accepted" ? "Confirm Acceptance" : "Decline and Offer Next"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
