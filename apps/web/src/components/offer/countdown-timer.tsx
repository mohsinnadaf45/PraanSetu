"use client";

import React, { useState, useEffect } from "react";
import { formatTimeRemaining } from "@/lib/formatters";
import { Clock, AlertTriangle } from "lucide-react";

export interface CountdownTimerProps {
  expiresAt: string;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({
  expiresAt,
  onExpire,
  className = "",
}: CountdownTimerProps) {
  const [time, setTime] = useState(() => formatTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = formatTimeRemaining(expiresAt);
      setTime(updated);
      if (updated.isExpired) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  if (time.isExpired) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-100 text-stone-600 font-mono text-xs border border-stone-300 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-stone-400" />
        Window Expired
      </span>
    );
  }

  // Visual cues: < 30 mins turns red/alert, < 2 hours turns amber
  const totalMin = time.hours * 60 + time.minutes;
  let styleClasses = "bg-emerald-50 text-emerald-900 border-emerald-300";
  if (totalMin < 30) {
    styleClasses = "bg-rose-50 text-rose-900 border-rose-300 animate-pulse";
  } else if (totalMin < 120) {
    styleClasses = "bg-amber-50 text-amber-900 border-amber-300";
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border font-mono text-xs font-semibold shadow-2xs ${styleClasses} ${className}`}
      title="Remaining response window before organ is offered to next candidate"
    >
      {totalMin < 30 ? (
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
      )}
      <span>{time.formatted}</span>
    </div>
  );
}
