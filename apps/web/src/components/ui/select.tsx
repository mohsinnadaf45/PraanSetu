import * as React from "react";
import { cn } from "./button";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, options, children, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={cn(
            "flex h-9 w-full rounded-md border border-ink-border bg-surface px-3 py-1 text-sm text-ink transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent",
            "disabled:cursor-not-allowed disabled:bg-canvas",
            error && "border-status-red focus-visible:ring-status-red",
            className
          )}
          ref={ref}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p className="text-xs font-medium text-status-red">{error}</p>
        )}

      </div>
    );
  }
);
Select.displayName = "Select";
