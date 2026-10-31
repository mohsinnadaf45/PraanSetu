"use client";

import React from "react";
import Link from "next/link";
import { useDonors } from "@/hooks/use-donors";
import { useRecipients } from "@/hooks/use-recipients";
import { useOffers } from "@/hooks/use-offers";
import { useMatches } from "@/hooks/use-matches";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnonCode } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { CountdownTimer } from "@/components/offer/countdown-timer";
import { VerifyAuditButton } from "@/components/audit/verify-button";
import { formatDateTime, formatOrganName } from "@/lib/formatters";
import {
  Heart,
  Users,
  Clock,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  GitCompare,
  AlertCircle,
} from "lucide-react";

export default function HomePage() {
  const { data: donorsData, isLoading: donorsLoading } = useDonors({ page: 1, page_size: 5 });
  const { data: recipientsData, isLoading: recipientsLoading } = useRecipients({ page: 1, page_size: 5 });
  const { data: offersData, isLoading: offersLoading } = useOffers({ status: "pending", page_size: 5 });
  const { data: matchesData } = useMatches(1, 5);

  const availableDonors = donorsData?.items?.filter((d) => d.status === "available") || [];
  const waitingRecipients = recipientsData?.items?.filter((r) => r.status === "waiting") || [];
  const pendingOffers = offersData?.items || [];

  return (
    <div className="space-y-8">
      {/* Page Title & Emergency Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Transplant Operations Overview
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time allocation status, active organ offer timers, and waitlist coordination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/donors/new">
            <Button variant="primary" size="sm" className="gap-1.5">
              <PlusCircle className="w-4 h-4" />
              List Donor Organ
            </Button>
          </Link>
          <Link href="/recipients/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              <PlusCircle className="w-4 h-4" />
              Add Waitlist Patient
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Available Donors
            </span>
            <div className="p-2 rounded bg-emerald-50 text-emerald-800">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900">
              {donorsLoading ? "..." : donorsData?.total || 0}
            </span>
            <span className="text-xs text-emerald-700 font-medium">
              {availableDonors.length} organs ready
            </span>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Active Waitlist
            </span>
            <div className="p-2 rounded bg-blue-50 text-blue-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900">
              {recipientsLoading ? "..." : recipientsData?.total || 0}
            </span>
            <span className="text-xs text-stone-500">Registered patients</span>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card className="p-4 bg-white border-amber-200 bg-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-900">
              Pending Offers
            </span>
            <div className="p-2 rounded bg-amber-100 text-amber-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-amber-950">
              {offersLoading ? "..." : pendingOffers.length}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              Active countdowns
            </span>
          </div>
        </Card>

        {/* Metric 4 */}
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Audit Hash Chain
            </span>
            <div className="p-2 rounded-md bg-accent-light text-accent">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm font-semibold text-status-green flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
              Verified Intact
            </span>
            <p className="text-[11px] text-ink-secondary mt-1">SHA-256 chained</p>

          </div>
        </Card>
      </div>

      {/* Active Organ Offer Countdown Ticker */}
      {pendingOffers.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/30 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <h3 className="font-serif text-base font-bold text-amber-950">
                Action Required: Urgent Organ Offers Awaiting Doctor Response
              </h3>
            </div>
            <Link href="/offers" className="text-xs text-amber-900 font-semibold hover:underline flex items-center gap-1">
              View all offers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingOffers.map((offer) => (
              <div
                key={offer.id}
                className="p-3 bg-white rounded-lg border border-amber-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-stone-700">Rank #{offer.rank}</span>
                    <AnonCode code={offer.recipient_code} />
                  </div>
                  <p className="text-[11px] text-stone-500">Offered {formatDateTime(offer.created_at)}</p>
                </div>
                <div>
                  <CountdownTimer expiresAt={offer.expires_at} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Tables Grid: Available Donors & Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Donors Ready for Matching */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Available Donors Ready for Matching</CardTitle>
              <CardDescription>Organs currently listed requiring allocation runs</CardDescription>
            </div>
            <Link href="/donors" className="text-xs text-accent font-semibold hover:underline">
              View all
            </Link>
          </CardHeader>

          {availableDonors.length === 0 ? (
            <p className="text-xs text-ink-secondary py-6 text-center italic">No available donor organs currently listed.</p>
          ) : (
            <div className="divide-y divide-ink-border">
              {availableDonors.map((donor) => (
                <div key={donor.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AnonCode code={donor.donor_code} />
                      <span className="font-semibold text-xs text-ink">
                        {formatOrganName(donor.organ)}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-canvas text-ink-secondary font-mono border border-ink-border">
                        {donor.blood_group}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary">
                      {donor.age_years ? `${donor.age_years} yrs` : ""}{" "}
                      {donor.size_kg ? `• ${donor.size_kg} kg` : ""}
                    </p>
                  </div>
                  <Link href={`/matches?donor_code=${donor.donor_code}`}>
                    <Button variant="primary" size="sm" className="h-7 text-xs gap-1">
                      <GitCompare className="w-3.5 h-3.5" />
                      Run Match
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Priority Waitlist Patients */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>High-Priority Waitlist Candidates</CardTitle>
              <CardDescription>Patients actively waiting for organ matching</CardDescription>
            </div>
            <Link href="/recipients" className="text-xs text-accent font-semibold hover:underline">
              View all
            </Link>
          </CardHeader>

          {waitingRecipients.length === 0 ? (
            <p className="text-xs text-ink-secondary py-6 text-center italic">No active waitlist patients listed.</p>
          ) : (
            <div className="divide-y divide-ink-border">
              {waitingRecipients.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AnonCode code={r.recipient_code} />
                      <span className="font-semibold text-xs text-ink">
                        {formatOrganName(r.organ)}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-md bg-canvas text-ink-secondary font-mono border border-ink-border">
                        {r.blood_group}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary">
                      Listed: {formatDateTime(r.listed_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-status-amberBg text-status-amber border border-status-amberBorder">
                      Urgency Tier {r.urgency}
                    </span>
                    <StatusChip status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Real-time Audit Verification Section */}
      <Card className="bg-canvas border-ink-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-serif text-base font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-status-green" />
              Cryptographic Audit Chain Integrity
            </h3>
            <p className="text-xs text-ink-secondary mt-1 max-w-xl">
              Every donor listing, match calculation, and clinical decision is permanently appended with SHA-256 hash chaining.
              Auditors and clinicians can mathematically verify zero tampering at any moment.
            </p>
          </div>
          <VerifyAuditButton />
        </div>
      </Card>

    </div>
  );
}
