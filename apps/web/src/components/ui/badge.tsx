import * as React from "react";
import { cn } from "./button";
import { ShieldCheck, ShieldAlert, Lock } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "code" | "shield" | "urgency" | "role";
}

export function Badge({
  className,
  variant = "neutral",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    neutral: "bg-stone-100 text-stone-700 border-stone-200",
    code: "bg-[#f1f0ea] text-stone-900 font-mono font-semibold tracking-wide border-stone-300",
    shield: "bg-emerald-50 text-emerald-800 border-emerald-200/80 font-mono text-xs",
    urgency: "bg-amber-50 text-amber-800 border-amber-300 font-semibold",
    role: "bg-[#e8f0ec] text-[#1e3a2f] border-[#c3d9cf] font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === "shield" && <Lock className="w-3 h-3 text-emerald-700 inline" />}
      {children}
    </span>
  );
}

export function AnonCode({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-semibold text-xs px-2 py-0.5 rounded bg-[#f4f3ef] border border-stone-300 text-stone-900 tracking-wider",
        className
      )}
      title="Anonymous Patient Code (Identity Encrypted in Vault)"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
      {code}
    </span>
  );
}
