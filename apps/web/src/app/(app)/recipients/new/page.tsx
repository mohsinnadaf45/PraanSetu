"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateRecipient } from "@/hooks/use-recipients";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Shield, AlertCircle, HeartPulse, UserPlus } from "lucide-react";

export default function NewRecipientPage() {
  const router = useRouter();
  const { mutateAsync: createRecipient, isPending } = useCreateRecipient();

  const [organ, setOrgan] = useState("kidney");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [urgency, setUrgency] = useState("3");
  const [sizeKg, setSizeKg] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [hlaA, setHlaA] = useState("01, 02");
  const [hlaB, setHlaB] = useState("08, 44");
  const [hlaDR, setHlaDR] = useState("03, 07");

  // Vault identity fields (never stored in main database)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [govId, setGovId] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const hla = {
        A: hlaA.split(",").map((s) => s.trim()).filter(Boolean),
        B: hlaB.split(",").map((s) => s.trim()).filter(Boolean),
        DR: hlaDR.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await createRecipient({
        organ: organ as any,
        blood_group: bloodGroup as any,
        urgency: parseInt(urgency, 10),
        size_kg: sizeKg ? parseFloat(sizeKg) : undefined,
        age_years: ageYears ? parseInt(ageYears, 10) : undefined,
        hla,
      });

      // If legal contact details provided, encrypt and store in Identity Vault
      if (fullName && phone && res.recipient_code) {
        try {
          await api.identity.store({
            code: res.recipient_code,
            full_name: fullName,
            phone,
            gov_id: govId || undefined,
          });
        } catch {
          // Non-blocking if identity vault is offline in local dev
        }
      }

      router.push("/recipients");
    } catch (err: any) {
      setError(err?.message || "Failed to register recipient.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
        <Link href="/recipients">
          <Button variant="ghost" size="sm" className="p-1.5 h-8">
            <ArrowLeft className="w-4 h-4 text-stone-600" />
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
            Register Waitlist Candidate
          </h1>
          <p className="text-xs text-stone-500">
            Generate anonymous recipient code and establish clinical urgency tier.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Clinical Compatibility & Urgency */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#1e3a2f]" />
              Clinical & Urgency Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Target Organ"
                value={organ}
                onChange={(e) => setOrgan(e.target.value)}
                options={[
                  { value: "kidney", label: "Kidney" },
                  { value: "liver", label: "Liver" },
                  { value: "heart", label: "Heart" },
                  { value: "lung", label: "Lung" },
                  { value: "pancreas", label: "Pancreas" },
                ]}
              />

              <Select
                label="ABO Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                options={[
                  { value: "O+", label: "O Positive (O+)" },
                  { value: "O-", label: "O Negative (O-)" },
                  { value: "A+", label: "A Positive (A+)" },
                  { value: "A-", label: "A Negative (A-)" },
                  { value: "B+", label: "B Positive (B+)" },
                  { value: "B-", label: "B Negative (B-)" },
                  { value: "AB+", label: "AB Positive (AB+)" },
                  { value: "AB-", label: "AB Negative (AB-)" },
                ]}
              />

              <Select
                label="Urgency Tier (Medical Status)"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                options={[
                  { value: "1", label: "Tier 1: Emergency / Critical ICU" },
                  { value: "2", label: "Tier 2: Urgent / In-patient" },
                  { value: "3", label: "Tier 3: Standard Maintenance Dialysis" },
                  { value: "4", label: "Tier 4: Stable Pre-dialysis" },
                  { value: "5", label: "Tier 5: Early Listing" },
                ]}
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Weight (kg)"
                  type="number"
                  placeholder="e.g. 68"
                  value={sizeKg}
                  onChange={(e) => setSizeKg(e.target.value)}
                />
                <Input
                  label="Age (years)"
                  type="number"
                  placeholder="e.g. 42"
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: HLA Typing */}
          <div className="pt-4 border-t border-stone-200">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
              HLA Tissue Typing (Comma Separated Alleles)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="HLA-A Alleles"
                placeholder="01, 02"
                value={hlaA}
                onChange={(e) => setHlaA(e.target.value)}
                className="font-mono text-xs"
              />
              <Input
                label="HLA-B Alleles"
                placeholder="08, 44"
                value={hlaB}
                onChange={(e) => setHlaB(e.target.value)}
                className="font-mono text-xs"
              />
              <Input
                label="HLA-DR Alleles"
                placeholder="03, 07"
                value={hlaDR}
                onChange={(e) => setHlaDR(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5 font-mono">
              HLA matches determine histocompatibility scoring in the determinism engine.
            </p>
          </div>

          {/* Section 3: Identity Vault Fields */}
          <div className="pt-4 border-t border-stone-200 bg-stone-50/50 p-4 rounded-lg border">
            <div className="flex items-start gap-2.5 mb-3">
              <Shield className="w-4 h-4 text-[#1e3a2f] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-stone-900">
                  Dual-Custody Vault Registration (Optional)
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  These identity details are sent directly to the encrypted Identity Vault database using AES-256 envelope encryption. They are completely excluded from the clinical database and matching logs.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Full Legal Name"
                placeholder="Patient Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Emergency Phone"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="National ID / ABHA ID"
                placeholder="ABHA / Aadhaar Ref"
                value={govId}
                onChange={(e) => setGovId(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <Link href="/recipients">
              <Button variant="secondary" type="button">Cancel</Button>
            </Link>
            <Button variant="primary" type="submit" disabled={isPending} className="gap-1.5">
              <UserPlus className="w-4 h-4" />
              {isPending ? "Registering Candidate..." : "Register Waitlist Candidate"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
