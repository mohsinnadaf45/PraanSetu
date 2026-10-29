"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, KeyRound, AlertCircle, Info } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const { login, verifyMfa } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaPendingToken, setMfaPendingToken] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.mfaRequired && res.mfaPendingToken) {
        setMfaPendingToken(res.mfaPendingToken);
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      if (err?.message?.includes("fetch") || err?.name === "TypeError") {
        setError("Unable to reach PraanSetu API (https://praansetu-api.onrender.com). If the server was idle, it may take ~30s to wake up on Render free tier. Please try again.");
      } else {
        setError(err?.message || "Invalid credentials. Please verify your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaPendingToken) return;
    setError(null);
    setLoading(true);

    try {
      await verifyMfa(mfaPendingToken, totpCode);
      router.push("/home");
    } catch (err: any) {
      setError(err?.message || "Invalid TOTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to fill demo account
  const setDemoAccount = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("AdminPass1!");
  };

  return (
    <div>
      {!mfaPendingToken ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
              Authorized Personnel Sign In
            </h3>
            <p className="text-xs text-stone-500">
              Access the clinical allocation console with your hospital credentials.
            </p>
          </div>

          <div className="space-y-3">
            <Input
              label="Hospital Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.gov.in"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Sign In to Platform
          </Button>

          {/* Quick Demo Assist */}
          <div className="mt-4 pt-4 border-t border-stone-100">
            <p className="text-[11px] font-semibold text-stone-600 mb-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              Quick fill credentials (Demo / Dev environment):
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setDemoAccount("admin@praansetu.in")}
                className="text-[11px] px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("doctor@aiims.gov.in");
                  setPassword("DoctorPass1!");
                }}
                className="text-[11px] px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
              >
                Doctor
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 mx-auto mb-2">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Two-Factor Authentication
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Enter the 6-digit verification code from your authenticator application.
            </p>
          </div>

          <Input
            label="6-Digit TOTP Code"
            type="text"
            maxLength={6}
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="text-center tracking-widest font-mono text-lg font-bold"
            required
            autoFocus
          />

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Verify and Complete Sign In
          </Button>

          <button
            type="button"
            onClick={() => {
              setMfaPendingToken(null);
              setError(null);
            }}
            className="w-full text-xs text-stone-500 hover:text-stone-800 text-center font-medium"
          >
            ← Back to Password Login
          </button>
        </form>
      )}
    </div>
  );
}
