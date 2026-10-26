"use client";

import * as React from "react";
import { cn } from "./button";
import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-lg border border-stone-200 bg-white p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-150",
          className
        )}
      >
        <div className="flex items-start justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-xs text-stone-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  );
}
