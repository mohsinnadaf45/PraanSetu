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
    <header className="h-16 bg-white border-b border-stone-200/90 px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Affiliation Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#fbfbf9] border border-stone-200 text-xs font-medium text-stone-700">
          <Building2 className="w-3.5 h-3.5 text-stone-500" />
          <span>Regional Network: <strong>National Waitlist (India)</strong></span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Audit Chain Online</span>
        </div>
      </div>

      {/* User Information & Actions */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <UserCircle2 className="w-4 h-4 text-stone-400" />
            <span className="text-xs font-semibold text-stone-900">
              {user?.email || "doctor@hospital.gov.in"}
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#1e3a2f] block">
            {roleName}
          </span>
        </div>

        <div className="h-7 w-px bg-stone-200" />

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-stone-600 hover:text-red-700 gap-1.5 text-xs"
          title="Sign out of PraanSetu"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
