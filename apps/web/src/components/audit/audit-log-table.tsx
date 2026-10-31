"use client";

import React, { useState } from "react";
import { AuditLogEntry } from "@/lib/api-client";
import { formatDateTime } from "@/lib/formatters";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { KeyRound, Shield, FileText } from "lucide-react";

export function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 border border-stone-200 rounded-lg bg-white">
        <p className="text-sm text-stone-500">No audit log records recorded yet.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor Code</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>SHA-256 Entry Fingerprint</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-mono text-xs text-stone-700 whitespace-nowrap">
                {formatDateTime(entry.time)}
              </TableCell>
              <TableCell>
                <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200">
                  {entry.actor_code}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 font-medium text-xs text-accent">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  {entry.action}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs text-ink-secondary max-w-xs truncate" title={entry.entry_hash}>
                {entry.entry_hash.slice(0, 16)}...{entry.entry_hash.slice(-8)}
              </TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => setSelectedEntry(entry)}
                  className="text-xs text-accent hover:underline font-medium inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Payload
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Entry Details Modal */}
      {selectedEntry && (
        <Dialog
          open={Boolean(selectedEntry)}
          onClose={() => setSelectedEntry(null)}
          title="Cryptographic Audit Entry"
          description={`ID: ${selectedEntry.id}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 bg-canvas rounded-md border border-ink-border space-y-2">
              <div>
                <span className="text-ink-secondary block">Actor Code:</span>
                <span className="font-bold text-ink">{selectedEntry.actor_code}</span>
              </div>
              <div>
                <span className="text-ink-secondary block">Action:</span>
                <span className="font-bold text-accent">{selectedEntry.action}</span>
              </div>

              <div>
                <span className="text-stone-500 block">Timestamp:</span>
                <span className="text-stone-800">{selectedEntry.time}</span>
              </div>
            </div>

            <div>
              <span className="text-stone-600 font-sans font-semibold block mb-1">
                Cryptographic Linkage (SHA-256):
              </span>
              <div className="p-2.5 bg-stone-100 rounded border border-stone-200 space-y-1.5 break-all">
                <p>
                  <span className="text-stone-500">Payload Hash:</span><br />
                  <span className="text-stone-900">{selectedEntry.payload_hash}</span>
                </p>
                <p>
                  <span className="text-stone-500">Previous Entry Hash:</span><br />
                  <span className="text-stone-900">{selectedEntry.prev_hash}</span>
                </p>
                <p className="font-bold text-emerald-900">
                  <span className="text-emerald-700">Current Entry Hash:</span><br />
                  <span>{selectedEntry.entry_hash}</span>
                </p>
              </div>
            </div>

            {selectedEntry.extra && Object.keys(selectedEntry.extra).length > 0 && (
              <div>
                <span className="text-stone-600 font-sans font-semibold block mb-1">
                  Metadata / Extra Attributes:
                </span>
                <pre className="p-2.5 bg-stone-100 rounded border border-stone-200 overflow-x-auto text-[11px]">
                  {JSON.stringify(selectedEntry.extra, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}
