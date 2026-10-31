import * as React from "react";
import { cn } from "./button";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-ink-border bg-surface px-3 py-1 text-sm text-ink transition-colors",
            "placeholder:text-ink-secondary/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent",
            "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-secondary/50",
            error && "border-status-red focus-visible:ring-status-red",
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-ink-secondary">{hint}</p>
        )}
        {error && (
          <p className="text-xs font-medium text-status-red">{error}</p>
        )}

      </div>
    );
  }
);
Input.displayName = "Input";
