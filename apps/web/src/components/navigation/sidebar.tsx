"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { hasRequiredRole, ROLE_LABELS } from "@/lib/auth";
import {
  Home,
  Heart,
  Users,
  GitCompare,
  Clock,
  ShieldCheck,
  FileCheck,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/home", icon: Home },
  { name: "Donors Registry", href: "/donors", icon: Heart, roles: ["coordinator", "doctor", "committee", "auditor", "authority", "admin"] },
  { name: "Waitlist Patients", href: "/recipients", icon: Users, roles: ["coordinator", "doctor", "committee", "auditor", "authority", "admin"] },
  { name: "Allocation Matches", href: "/matches", icon: GitCompare, roles: ["coordinator", "doctor", "committee", "auditor", "authority", "admin"] },
  { name: "Active Offers", href: "/offers", icon: Clock, roles: ["coordinator", "doctor", "committee", "auditor", "authority", "admin"] },
  { name: "Committee Review", href: "/committee", icon: FileCheck, roles: ["committee", "admin"] },
  { name: "Audit & Integrity", href: "/audit", icon: ShieldCheck, roles: ["auditor", "authority", "admin"] },
  { name: "Fairness Reports", href: "/reports", icon: BarChart3, roles: ["authority", "auditor", "admin"] },
  { name: "System Admin", href: "/admin", icon: Settings, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role;

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return hasRequiredRole(userRole, item.roles);
  });

  return (
    <aside className="w-64 bg-canvas border-r border-ink-border flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-ink-border gap-3">
        <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-serif font-bold text-lg">
          PS
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold text-ink tracking-tight leading-none">
            PraanSetu
          </h1>
          <p className="text-[10px] text-ink-secondary uppercase tracking-widest mt-0.5">
            Bridge of Life
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "text-ink-secondary hover:bg-stone-200/50 hover:text-ink"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-white" : "text-ink-secondary"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Regulatory Badge Footer */}
      <div className="p-4 border-t border-ink-border bg-surface/50">
        <div className="flex items-center gap-2 text-xs text-ink-secondary mb-1">
          <Shield className="w-3.5 h-3.5 text-status-green shrink-0" />
          <span className="font-semibold text-ink">DPDP & NOTTO Guarded</span>
        </div>
        <p className="text-[11px] text-ink-secondary leading-tight">
          All PII isolated in encryption vault. Decisions cryptographically chained.
        </p>
      </div>
    </aside>
  );

}
