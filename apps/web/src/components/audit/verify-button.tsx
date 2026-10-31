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
        className="gap-2"
      >
        <ShieldCheck className="w-4 h-4" />
        Verify Hash Chain
      </Button>

      {result && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium animate-in fade-in duration-150 ${
            result.valid
              ? "bg-status-greenBg text-status-green border-status-greenBorder"
              : "bg-status-redBg text-status-red border-status-redBorder"
          }`}
        >
          {result.valid ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-status-green shrink-0" />
              <span>
                <strong className="text-ink">Cryptographic Integrity Verified:</strong> {result.entries_checked} entries checked without tampering.
              </span>
            </>
          ) : (
            <>
              <AlertOctagon className="w-4 h-4 text-status-red shrink-0" />
              <span>
                <strong className="text-ink">Chain Broken!</strong> {result.message}
              </span>
            </>
          )}
        </div>
      )}

    </div>
  );
}
