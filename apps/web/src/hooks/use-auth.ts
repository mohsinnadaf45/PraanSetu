"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, clearTokens, setTokens, User } from "@/lib/api-client";
import { getCurrentUserFromToken, isUserAuthenticated } from "@/lib/auth";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const current = getCurrentUserFromToken();
    setUser(current);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    if ("mfa_pending_token" in res) {
      return { mfaRequired: true, mfaPendingToken: res.mfa_pending_token };
    }
    setTokens(res.access_token, res.refresh_token);
    if (typeof window !== "undefined") {
      localStorage.setItem("praansetu_user_email", email);
    }
    refreshUser();
    return { mfaRequired: false };
  };

  const verifyMfa = async (mfa_pending_token: string, totp_code: string) => {
    const res = await api.auth.verifyMfa({ mfa_pending_token, totp_code });
    setTokens(res.access_token, res.refresh_token);
    refreshUser();
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    router.push("/sign-in");
  };

  return {
    user,
    loading,
    isAuthenticated: isUserAuthenticated(),
    login,
    verifyMfa,
    logout,
    refreshUser,
  };
}
