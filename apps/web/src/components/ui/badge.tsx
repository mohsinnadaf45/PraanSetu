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
    neutral: "bg-canvas text-ink-secondary border-ink-border",
    code: "bg-surface text-ink font-mono font-semibold tracking-wide border-ink-border",
    shield: "bg-status-greenBg text-status-green border-status-greenBorder font-mono text-xs",
    urgency: "bg-status-amberBg text-status-amber border-status-amberBorder font-semibold",
    role: "bg-accent-light text-accent border-accent-border font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs border font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === "shield" && <Lock className="w-3 h-3 text-status-green inline" />}
      {children}
    </span>
  );
}

export function AnonCode({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono font-semibold text-xs px-2 py-0.5 rounded-md bg-surface border border-ink-border text-ink tracking-wider",
        className
      )}
      title="Anonymous Patient Code (Identity Encrypted in Vault)"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-status-green inline-block" />
      {code}
    </span>
  );
}

