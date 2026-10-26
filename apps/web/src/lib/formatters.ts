/**
 * Formatting and Clinical Display Utilities
 */

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return isoString;
  }
}

export function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "yesterday";
    return `${diffDay}d ago`;
  } catch {
    return isoString;
  }
}

export function formatTimeRemaining(expiresAtIso: string): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
} {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: "Expired" };
  }

  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  const formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return { hours, minutes, seconds, isExpired: false, formatted };
}

export function getUrgencyInfo(level: number): {
  label: string;
  badgeClass: string;
  description: string;
} {
  switch (level) {
    case 5:
      return {
        label: "Critical (Tier 1)",
        badgeClass: "bg-red-100 text-red-800 border-red-300",
        description: "Immediate life threat; ITU admitted on ECMO/dialysis support",
      };
    case 4:
      return {
        label: "Urgent (Tier 2)",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
        description: "Hospitalized with rapid clinical decompensation",
      };
    case 3:
      return {
        label: "High Priority (Tier 3)",
        badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
        description: "Regular hemodialysis with failing vascular access",
      };
    case 2:
      return {
        label: "Standard (Tier 4)",
        badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
        description: "Stable maintenance waitlist",
      };
    case 1:
    default:
      return {
        label: "Elective (Tier 5)",
        badgeClass: "bg-stone-100 text-stone-700 border-stone-300",
        description: "Early waitlist listing",
      };
  }
}

export function formatOrganName(organ?: string): string {
  if (!organ) return "Unknown";
  return organ.charAt(0).toUpperCase() + organ.slice(1).toLowerCase();
}
