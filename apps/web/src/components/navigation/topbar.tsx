"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, Building2, UserCircle2, ShieldCheck } from "lucide-react";

export function Topbar() {
  const { user, logout } = useAuth();
  const roleName = user?.role ? ROLE_LABELS[user.role] || user.role : "Authorized User";

  return (
    <header className="h-16 bg-surface border-b border-ink-border px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Affiliation Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-canvas border border-ink-border text-xs font-medium text-ink-secondary">
          <Building2 className="w-3.5 h-3.5 text-ink-secondary" />
          <span>Regional Network: <strong className="text-ink">National Waitlist (India)</strong></span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-status-greenBg border border-status-greenBorder text-status-green text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-status-green" />
          <span>Audit Chain Online</span>
        </div>
      </div>

      {/* User Information & Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <UserCircle2 className="w-4 h-4 text-ink-secondary/70" />
            <span className="text-xs font-semibold text-ink">
              {user?.email || "doctor@hospital.gov.in"}
            </span>
          </div>
          <span className="text-[11px] font-medium text-accent block">
            {roleName}
          </span>
        </div>

        <div className="h-7 w-px bg-ink-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-ink-secondary hover:text-status-red gap-1.5 text-xs"
          title="Sign out of PraanSetu"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );

}
