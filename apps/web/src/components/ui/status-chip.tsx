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
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "waiting":
      case "pending":
      case "offered":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "matched":
      case "transplanted":
        return "bg-sky-50 text-sky-800 border-sky-300";
      case "declined":
      case "rejected":
      case "withdrawn":
        return "bg-rose-50 text-rose-800 border-rose-300";
      case "overridden":
        return "bg-purple-50 text-purple-800 border-purple-300";
      case "expired":
      case "suspended":
      case "inactive":
      default:
        return "bg-stone-100 text-stone-600 border-stone-300";
    }
  };

  const formatText = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStyle(),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {formatText(status)}
    </span>
  );
}
