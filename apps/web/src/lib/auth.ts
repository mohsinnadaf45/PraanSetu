/**
 * Auth Helper Utilities
 * Token management, role checking, and session persistence.
 */
import { jwtDecode } from "jwt-decode";
import { clearTokens, getAccessToken, User } from "./api-client";

export interface JwtPayload {
  sub: string;
  role: "admin" | "doctor" | "coordinator" | "committee" | "auditor" | "authority";
  exp: number;
  type: string;
  hospital_id?: string;
  email?: string;
}

export function getCurrentUserFromToken(): Partial<User> | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    // Check expiration
    if (decoded.exp * 1000 < Date.now()) {
      clearTokens();
      return null;
    }
    return {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email || localStorage.getItem("praansetu_user_email") || "",
      hospital_id: decoded.hospital_id,
    };
  } catch {
    clearTokens();
    return null;
  }
}

export function isUserAuthenticated(): boolean {
  return getCurrentUserFromToken() !== null;
}

export function hasRequiredRole(
  userRole: string | undefined,
  allowedRoles: string[]
): boolean {
  if (!userRole) return false;
  if (userRole === "admin") return true; // Superuser override
  return allowedRoles.includes(userRole);
}

export const ROLE_LABELS: Record<string, string> = {
  coordinator: "Hospital Coordinator",
  doctor: "Transplant Doctor",
  committee: "Transplant Committee",
  auditor: "Independent Auditor",
  authority: "State / National Authority",
  admin: "System Administrator",
};
