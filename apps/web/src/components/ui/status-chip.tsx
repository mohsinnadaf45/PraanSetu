import React from "react";
import { cn } from "./button";

export interface StatusChipProps {
  status: string;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const normalized = (status || "").toLowerCase();

  const getStyle = () => {
    switch (normalized) {
      case "available":
      case "accepted":
      case "approved":
        return "bg-status-greenBg text-status-green border-status-greenBorder";
      case "waiting":
      case "pending":
      case "offered":
        return "bg-status-amberBg text-status-amber border-status-amberBorder";
      case "matched":
      case "transplanted":
        return "bg-accent-light text-accent border-accent-border";
      case "declined":
      case "rejected":
      case "withdrawn":
        return "bg-status-redBg text-status-red border-status-redBorder";
      case "overridden":
        return "bg-slate-100 text-ink border-ink-border";
      case "expired":
      case "suspended":
      case "inactive":
      default:
        return "bg-canvas text-ink-secondary border-ink-border";
    }
  };

  const formatText = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        getStyle(),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {formatText(status)}
    </span>
  );

}
