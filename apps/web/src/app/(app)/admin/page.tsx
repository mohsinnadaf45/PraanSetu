"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, User, Hospital, RuleVersion } from "@/lib/api-client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/formatters";
import { Settings, Users, Building2, BookOpen, PlusCircle, CheckCircle2, XCircle, ShieldCheck, AlertCircle } from "lucide-react";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"users" | "hospitals" | "rules">("users");

  // User modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("doctor");
  const [userHospitalId, setUserHospitalId] = useState("");
  const [userError, setUserError] = useState<string | null>(null);

  // Hospital modal state
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalRegion, setHospitalRegion] = useState("Maharashtra");
  const [hospitalError, setHospitalError] = useState<string | null>(null);

  // Queries
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.admin.users.list(1, 50),
    enabled: activeTab === "users",
  });

  const { data: hospitalsData, isLoading: isHospitalsLoading } = useQuery({
    queryKey: ["admin", "hospitals"],
    queryFn: () => api.admin.hospitals.list(1, 50),
    enabled: activeTab === "hospitals" || isAddUserOpen,
  });

  const { data: rulesData, isLoading: isRulesLoading } = useQuery({
    queryKey: ["admin", "rules"],
    queryFn: () => api.admin.ruleVersions.list(1, 50),
    enabled: activeTab === "rules",
  });

  // Mutations
  const { mutateAsync: createUser, isPending: isCreatingUser } = useMutation({
    mutationFn: (body: { email: string; password: string; role: string; hospital_id?: string }) =>
      api.admin.users.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsAddUserOpen(false);
      setUserEmail("");
      setUserPassword("");
      setUserError(null);
    },
  });

  const { mutateAsync: createHospital, isPending: isCreatingHospital } = useMutation({
    mutationFn: (body: { name: string; region: string }) =>
      api.admin.hospitals.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hospitals"] });
      setIsAddHospitalOpen(false);
      setHospitalName("");
      setHospitalError(null);
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserError(null);
    try {
      await createUser({
        email: userEmail,
        password: userPassword,
        role: userRole,
        hospital_id: userHospitalId || undefined,
      });
    } catch (err: any) {
      setUserError(err?.message || "Failed to create user.");
    }
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setHospitalError(null);
    try {
      await createHospital({
        name: hospitalName,
        region: hospitalRegion,
      });
    } catch (err: any) {
      setHospitalError(err?.message || "Failed to register hospital.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            System Administration Console
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage authorized hospital personnel, institutional nodes, and NOTTO allocation rule versions.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-[#1e3a2f] text-[#1e3a2f]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab("hospitals")}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "hospitals"
              ? "border-[#1e3a2f] text-[#1e3a2f]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hospital Nodes</span>
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "rules"
              ? "border-[#1e3a2f] text-[#1e3a2f]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Allocation Rule Versions</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Role-based access credentials (Admins, Attending Doctors, Coordinators, Committee members, and Auditors).
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddUserOpen(true)}
              className="gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Add User Account
            </Button>
          </div>

          {isUsersLoading ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
              <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-2" />
              <p className="text-xs text-stone-500 font-mono">Loading user registry...</p>
            </div>
          ) : !usersData || usersData.items.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
              <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-500">No users found.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Hospital Affiliation</TableHead>
                    <TableHead>MFA Status</TableHead>
                    <TableHead>Account Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.items.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-mono text-xs font-semibold text-stone-900">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase bg-stone-100 text-stone-800 border border-stone-200">
                          {u.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-stone-600 font-mono">
                        {u.hospital_id ? `Hospital #${u.hospital_id.substring(0, 8)}` : "National / Unaffiliated"}
                      </TableCell>
                      <TableCell>
                        {u.mfa_enabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> TOTP Enabled
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 font-mono">Password Only</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOSPITALS */}
      {activeTab === "hospitals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              Verified transplant centers and hospital partner nodes licensed under NOTTO.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddHospitalOpen(true)}
              className="gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Register Hospital Node
            </Button>
          </div>

          {isHospitalsLoading ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
              <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-2" />
              <p className="text-xs text-stone-500 font-mono">Loading hospital directory...</p>
            </div>
          ) : !hospitalsData || hospitalsData.items.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
              <Building2 className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-500">No hospitals registered yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Region / Jurisdiction</TableHead>
                    <TableHead>Verification Status</TableHead>
                    <TableHead>Node ID</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitalsData.items.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-semibold text-xs text-stone-900">
                        {h.name}
                      </TableCell>
                      <TableCell className="text-xs text-stone-600">
                        {h.region}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Center
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-stone-500">
                        {h.id.substring(0, 8)}
                      </TableCell>
                      <TableCell className="text-xs text-stone-500 font-mono">
                        {formatDateTime(h.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RULE VERSIONS */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          <p className="text-xs text-stone-500">
            Immutable allocation rule sets loaded by the matching engine. Each version is cryptographically fingerprinted.
          </p>

          {isRulesLoading ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
              <div className="inline-block w-6 h-6 border-2 border-stone-300 border-t-[#1e3a2f] rounded-full animate-spin mb-2" />
              <p className="text-xs text-stone-500 font-mono">Loading rule versions...</p>
            </div>
          ) : !rulesData || rulesData.items.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-200 rounded-lg">
              <BookOpen className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-xs text-stone-500">No rule versions registered.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organ</TableHead>
                    <TableHead>Version Tag</TableHead>
                    <TableHead>Weights YAML Hash (SHA-256)</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rulesData.items.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-semibold text-xs text-stone-900 uppercase">
                        {r.organ}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-stone-800">
                        {r.version_tag}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-stone-500 max-w-xs truncate" title={r.weights_yaml_hash}>
                        {r.weights_yaml_hash?.slice(0, 16)}...{r.weights_yaml_hash?.slice(-8)}
                      </TableCell>
                      <TableCell className="text-xs text-stone-500 font-mono">
                        {formatDateTime(r.effective_from)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1e3a2f] bg-stone-100 px-2 py-0.5 rounded border border-stone-300">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active Protocol
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add User */}
      <Dialog
        open={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add Hospital / Authority User"
        description="Create account credentials with assigned role permissions."
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="doctor@hospital.in"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
          />

          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••••••"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            required
          />

          <Select
            label="User Role"
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            options={[
              { value: "doctor", label: "Attending Transplant Doctor" },
              { value: "coordinator", label: "Hospital Transplant Coordinator" },
              { value: "committee", label: "Ethics & Review Committee Member" },
              { value: "auditor", label: "Statutory Auditor" },
              { value: "authority", label: "NOTTO / SOTTO Authority" },
              { value: "admin", label: "Platform Administrator" },
            ]}
          />

          {hospitalsData?.items && hospitalsData.items.length > 0 && (
            <Select
              label="Hospital Affiliation (Optional)"
              value={userHospitalId}
              onChange={(e) => setUserHospitalId(e.target.value)}
              options={[
                { value: "", label: "-- None / National Authority --" },
                ...hospitalsData.items.map((h) => ({
                  value: h.id,
                  label: `${h.name} (${h.region})`,
                })),
              ]}
            />
          )}

          {userError && (
            <div className="p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{userError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreatingUser}>
              Create User
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Add Hospital */}
      <Dialog
        open={isAddHospitalOpen}
        onClose={() => setIsAddHospitalOpen(false)}
        title="Register Hospital Node"
        description="Add a verified institutional transplant center to PraanSetu."
      >
        <form onSubmit={handleCreateHospital} className="space-y-4">
          <Input
            label="Hospital Legal Name"
            placeholder="e.g. KEM Hospital Mumbai"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            required
          />

          <Input
            label="State / Region Jurisdiction"
            placeholder="e.g. Maharashtra"
            value={hospitalRegion}
            onChange={(e) => setHospitalRegion(e.target.value)}
            required
          />

          {hospitalError && (
            <div className="p-2.5 rounded bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{hospitalError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button type="button" variant="outline" onClick={() => setIsAddHospitalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isCreatingHospital}>
              Register Hospital
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
