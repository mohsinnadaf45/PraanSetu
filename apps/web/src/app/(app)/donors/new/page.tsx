"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateDonor } from "@/hooks/use-donors";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Shield, AlertCircle, HeartHandshake } from "lucide-react";

export default function NewDonorPage() {
  const router = useRouter();
  const { mutateAsync: createDonor, isPending } = useCreateDonor();

  const [organ, setOrgan] = useState("kidney");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [sizeKg, setSizeKg] = useState("");
  const [ageYears, setAgeYears] = useState("");
  const [crossmatch, setCrossmatch] = useState("negative");
  const [hlaA, setHlaA] = useState("01, 02");
  const [hlaB, setHlaB] = useState("07, 08");
  const [hlaDR, setHlaDR] = useState("03, 04");

  // Vault identity fields (never stored in main database)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

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

      const res = await createDonor({
        organ: organ as any,
        blood_group: bloodGroup as any,
        size_kg: sizeKg ? parseFloat(sizeKg) : undefined,
        age_years: ageYears ? parseInt(ageYears, 10) : undefined,
        test_results: {
          crossmatch,
          hla,
        },
      });

      // If legal contact details provided, encrypt and store in Vault
      if (fullName && phone && res.donor_code) {
        try {
          await api.identity.store({
            code: res.donor_code,
            full_name: fullName,
            phone,
          });
        } catch {
          // Non-blocking if identity vault is offline in local dev
        }
      }

      router.push(`/matches?donor_code=${res.donor_code}`);
    } catch (err: any) {
      setError(err?.message || "Failed to register donor.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
        <Link href="/donors">
          <Button variant="ghost" size="sm" className="p-1.5 h-8">
            <ArrowLeft className="w-4 h-4 text-stone-600" />
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
            Register Donor Organ
          </h1>
          <p className="text-xs text-stone-500">
            Generate anonymous donor code and enter compatibility parameters.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Organ & Compatibility */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-[#1e3a2f]" />
              Organ & Physiological Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Organ to Allocate *"
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
                label="ABO Blood Group *"
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

              <Input
                label="Estimated Weight (kg)"
                type="number"
                step="0.1"
                value={sizeKg}
                onChange={(e) => setSizeKg(e.target.value)}
                placeholder="e.g. 68.5"
                hint="Used for ±30% body size matching ratio filter"
              />

              <Input
                label="Donor Age (years)"
                type="number"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                placeholder="e.g. 35"
                hint="Pediatric priority applies if age < 18"
              />
            </div>
          </div>

          {/* Section 2: Immunology & Tissue Typing */}
          <div className="pt-4 border-t border-stone-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-3">
              Tissue Typing & Crossmatch Status
            </h3>

            <div className="space-y-4">
              <Select
                label="Crossmatch Status *"
                value={crossmatch}
                onChange={(e) => setCrossmatch(e.target.value)}
                options={[
                  { value: "negative", label: "Negative (Eligible for Allocation)" },
                  { value: "positive", label: "Positive (Absolute Exclusion)" },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="HLA-A Alleles"
                  value={hlaA}
                  onChange={(e) => setHlaA(e.target.value)}
                  placeholder="01, 02"
                />
                <Input
                  label="HLA-B Alleles"
                  value={hlaB}
                  onChange={(e) => setHlaB(e.target.value)}
                  placeholder="07, 08"
                />
                <Input
                  label="HLA-DR Alleles"
                  value={hlaDR}
                  onChange={(e) => setHlaDR(e.target.value)}
                  placeholder="03, 04"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Identity Vault Isolation */}
          <div className="pt-4 border-t border-stone-100">
            <div className="p-3 bg-stone-50 rounded border border-stone-200 mb-3 flex items-start gap-2 text-xs text-stone-600">
              <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Identity Vault Protection:</strong> Patient names and contact details are AES-256 encrypted directly into the Vault database. Only the anonymous code is accessible to matching.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Donor Full Name (Encrypted)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar (Optional)"
              />
              <Input
                label="Next-of-Kin Phone (Encrypted)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <Link href="/donors">
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isPending}>
              Register and Proceed to Matching
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
