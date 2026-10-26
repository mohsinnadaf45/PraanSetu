"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVerifyAudit } from "@/hooks/use-audit";
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertOctagon } from "lucide-react";

export function VerifyAuditButton() {
  const { mutateAsync: verify, isPending } = useVerifyAudit();
  const [result, setResult] = useState<{
    valid: boolean;
    entries_checked: number;
    message: string;
    first_bad_id?: string | null;
  } | null>(null);

  const handleVerify = async () => {
    try {
      const res = await verify();
      setResult(res);
    } catch (err: any) {
      setResult({
        valid: false,
        entries_checked: 0,
        message: err?.message || "Failed to verify chain.",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Button
        variant="primary"
        onClick={handleVerify}
        isLoading={isPending}
        className="gap-2 bg-[#1e3a2f] text-white hover:bg-[#142720]"
      >
        <ShieldCheck className="w-4 h-4" />
        Verify Hash Chain
      </Button>

      {result && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium animate-in fade-in duration-150 ${
            result.valid
              ? "bg-emerald-50 text-emerald-900 border-emerald-300"
              : "bg-rose-50 text-rose-900 border-rose-300"
          }`}
        >
          {result.valid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Cryptographic Integrity Verified:</strong> {result.entries_checked} entries checked without tampering.
              </span>
            </>
          ) : (
            <>
              <AlertOctagon className="w-4 h-4 text-rose-700 shrink-0" />
              <span>
                <strong>Chain Broken!</strong> {result.message}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
