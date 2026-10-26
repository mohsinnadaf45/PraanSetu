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
    <aside className="w-64 bg-[#fbfbf9] border-r border-stone-200/90 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center border-b border-stone-200/80 gap-3">
        <div className="w-8 h-8 rounded-md bg-[#1e3a2f] flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
          PS
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold text-stone-900 tracking-tight leading-none">
            PraanSetu
          </h1>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">
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
                  ? "bg-[#1e3a2f] text-white shadow-xs"
                  : "text-stone-700 hover:bg-stone-200/60 hover:text-stone-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? "text-white" : "text-stone-500"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Regulatory Badge Footer */}
      <div className="p-4 border-t border-stone-200/80 bg-stone-50/70">
        <div className="flex items-center gap-2 text-xs text-stone-600 mb-1">
          <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="font-semibold text-stone-800">DPDP & NOTTO Guarded</span>
        </div>
        <p className="text-[11px] text-stone-500 leading-tight">
          All PII isolated in encryption vault. Decisions cryptographically chained.
        </p>
      </div>
    </aside>
  );
}
