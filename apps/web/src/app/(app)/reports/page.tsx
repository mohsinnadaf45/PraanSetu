"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, FairnessReport } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getUrgencyInfo } from "@/lib/formatters";
import { BarChart3, TrendingUp, Clock, CheckCircle2, ShieldCheck, Scale, Calendar } from "lucide-react";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: report, isLoading, refetch } = useQuery<FairnessReport>({
    queryKey: ["reports", "fairness", startDate, endDate],
    queryFn: () => api.reports.fairness(startDate || undefined, endDate || undefined),
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Fairness & Allocation Analytics
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Algorithmic neutrality audits, distribution parity, and clinical acceptance rates across tiers.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs rounded border border-stone-300 py-1.5 px-2 bg-white text-stone-800"
          />
          <span className="text-xs text-stone-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs rounded border border-stone-300 py-1.5 px-2 bg-white text-stone-800"
          />
          <Button variant="secondary" size="sm" onClick={() => refetch()} className="text-xs">
            Filter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center bg-white border border-stone-200 rounded-lg">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-3" />
          <p className="text-xs text-stone-500 font-mono">Aggregating fairness distribution metrics...</p>
        </div>
      ) : !report ? (
        <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
          <Scale className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="font-serif font-semibold text-stone-800 text-sm">No report data generated yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Fairness metrics will populate automatically as matches and organ offers are processed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Total Dispatched Offers
                </span>
                <BarChart3 className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
                {report.total_offers}
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Generated via deterministic matching
              </p>
            </Card>

            <Card className="bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Total Accepted
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-950 mt-2">
                {report.total_accepted}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                Confirmed for transplant surgery
              </p>
            </Card>

            <Card className="bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Acceptance Rate
                </span>
                <TrendingUp className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
                {Math.round((report.acceptance_rate || 0) * 100)}%
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Conversion of primary & secondary offers
              </p>
            </Card>

            <Card className="bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  Avg. Wait Time
                </span>
                <Clock className="w-4 h-4 text-stone-400" />
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900 mt-2">
                {report.average_waiting_days ? Math.round(report.average_waiting_days) : 0} <span className="text-sm font-sans font-normal text-stone-500">days</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                From registry listing to acceptance
              </p>
            </Card>
          </div>

          {/* Detailed Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Urgency Tier */}
            <Card className="bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif font-bold text-stone-900 text-sm">
                  Distribution by Medical Urgency Tier
                </h3>
                <span className="text-[11px] text-stone-400 font-mono">Tiers 1-5</span>
              </div>

              <div className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Urgency Tier</TableHead>
                      <TableHead>Offers</TableHead>
                      <TableHead>Accepted</TableHead>
                      <TableHead className="text-right">Acceptance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(report.by_urgency || {}).map(([tierStr, stats]) => {
                      const tier = parseInt(tierStr, 10);
                      const urgencyInfo = getUrgencyInfo(tier);
                      const rate = stats.offers > 0 ? Math.round((stats.accepted / stats.offers) * 100) : 0;
                      return (
                        <TableRow key={tierStr}>
                          <TableCell>
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${urgencyInfo.badgeClass}`}>
                              {urgencyInfo.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{stats.offers}</TableCell>
                          <TableCell className="text-xs font-mono font-semibold text-emerald-800">{stats.accepted}</TableCell>
                          <TableCell className="text-right text-xs font-mono font-bold">
                            {rate}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* By ABO Blood Group */}
            <Card className="bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-serif font-bold text-stone-900 text-sm">
                  Distribution by ABO Blood Group
                </h3>
                <span className="text-[11px] text-stone-400 font-mono">Neutrality Check</span>
              </div>

              <div className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Offers</TableHead>
                      <TableHead>Accepted</TableHead>
                      <TableHead className="text-right">Acceptance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(report.by_blood_group || {}).map(([bg, stats]) => {
                      const rate = stats.offers > 0 ? Math.round((stats.accepted / stats.offers) * 100) : 0;
                      return (
                        <TableRow key={bg}>
                          <TableCell>
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                              {bg}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{stats.offers}</TableCell>
                          <TableCell className="text-xs font-mono font-semibold text-emerald-800">{stats.accepted}</TableCell>
                          <TableCell className="text-right text-xs font-mono font-bold">
                            {rate}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Compliance & Audit Assurance Footer */}
          <div className="p-4 bg-[#fbfbf9] rounded-lg border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
            <ShieldCheck className="w-5 h-5 text-[#1e3a2f] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-900">NOTTO Regulatory Compliance Assurance</p>
              <p className="mt-0.5 leading-relaxed">
                Fairness indices are computed directly from cryptographically logged match runs and offer timestamps. Under Section 10 of the Transplantation of Human Organs Act (THOTA), historical allocation distributions are preserved without modification for statutory inspection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
