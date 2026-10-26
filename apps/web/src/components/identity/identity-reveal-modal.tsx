"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";

export interface IdentityRevealModalProps {
  open: boolean;
  code: string;
  onClose: () => void;
}

export function IdentityRevealModal({
  open,
  code,
  onClose,
}: IdentityRevealModalProps) {
  const [reason, setReason] = useState("");
  const [step, setStep] = useState<"request" | "pending" | "revealed">("request");
  const [revealId, setRevealId] = useState<string | null>(null);
  const [identityData, setIdentityData] = useState<{
    full_name?: string;
    phone?: string;
    address?: string;
    gov_id?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("A written clinical emergency reason is required by legal statute.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Try to fetch directly if already authorized, or submit reveal request
      try {
        const direct = await api.identity.getRevealedIdentity(code);
        setIdentityData(direct);
        setStep("revealed");
        return;
      } catch {
        // If not directly available, create formal reveal request
        const res = await api.identity.requestReveal(code, reason);
        setRevealId(res.id);
        setStep("pending");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to submit identity reveal request.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReason("");
    setStep("request");
    setRevealId(null);
    setIdentityData(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleReset}
      title="Restricted Patient Identity Vault"
      description={`Encrypted records for anonymous patient ${code}`}
    >
      <div className="space-y-4">
        {step === "request" && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">DPDP Act & THOTA Protected Health Information</p>
                <p className="mt-0.5">
                  Patient real names and contact details are stored in an isolated, encrypted vault.
                  Any reveal request generates a tamper-evident audit log event and requires committee approval.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Clinical Emergency Justification <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Recipient matched and accepted; surgical transfer coordination requires verified identity contact."
                className="w-full text-sm rounded-md border border-stone-300 p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#1e3a2f]"
                required
              />
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Request Vault Decryption
              </Button>
            </div>
          </form>
        )}

        {step === "pending" && (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 mx-auto">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-stone-900">
              Reveal Request Submitted
            </h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto">
              Request ID: <code className="font-mono font-bold">{revealId}</code>. In accordance with multi-custody security, an ethics committee member or admin must countersign before plaintext keys are unlocked.
            </p>
            <div className="pt-3">
              <Button variant="secondary" onClick={handleReset}>
                Close
              </Button>
            </div>
          </div>
        )}

        {step === "revealed" && identityData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-2.5 rounded bg-emerald-50 text-emerald-800 text-xs border border-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Identity decrypted under authorized emergency protocol.</span>
            </div>

            <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-sm space-y-2">
              <div>
                <span className="text-xs text-stone-500 uppercase block font-semibold">Full Legal Name:</span>
                <span className="font-semibold text-stone-900">{identityData.full_name || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-stone-500 uppercase block font-semibold">Phone Contact:</span>
                <span className="font-mono font-medium text-stone-800">{identityData.phone || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-stone-500 uppercase block font-semibold">Residence Address:</span>
                <span className="text-stone-800">{identityData.address || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-stone-500 uppercase block font-semibold">Government Identity (Encrypted Vault):</span>
                <span className="font-mono text-stone-800">{identityData.gov_id || "—"}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={handleReset}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
