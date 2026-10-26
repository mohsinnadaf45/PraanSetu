/**
 * PraanSetu API Client
 * Typed service layer consuming FastAPI backend endpoints.
 * Base URL configured via NEXT_PUBLIC_API_URL.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiErrorResponse {
  detail?: string | { msg?: string }[] | Record<string, unknown>;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  data: ApiErrorResponse;

  constructor(status: number, data: ApiErrorResponse) {
    const detailMsg =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail) && data.detail[0]?.msg
        ? data.detail[0].msg
        : data.message || "An unexpected error occurred.";
    super(detailMsg);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Token helper functions (in-memory + localStorage for persistence)
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("praansetu_access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("praansetu_refresh_token");
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("praansetu_access_token", accessToken);
  localStorage.setItem("praansetu_refresh_token", refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("praansetu_access_token");
  localStorage.removeItem("praansetu_refresh_token");
  localStorage.removeItem("praansetu_user");
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...options, headers });

  // Handle Token Refresh on 401 Unauthorized
  if (res.status === 401 && getRefreshToken() && !endpoint.includes("/auth/")) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: getRefreshToken() }),
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setTokens(refreshData.access_token, refreshData.refresh_token);
        headers.set("Authorization", `Bearer ${refreshData.access_token}`);
        res = await fetch(url, { ...options, headers });
      } else {
        clearTokens();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/sign-in")) {
          window.location.href = "/sign-in";
        }
      }
    } catch {
      clearTokens();
    }
  }

  if (!res.ok) {
    let errData: ApiErrorResponse = {};
    try {
      errData = await res.json();
    } catch {
      errData = { message: res.statusText };
    }
    throw new ApiError(res.status, errData);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  role: "admin" | "doctor" | "coordinator" | "committee" | "auditor" | "authority";
  hospital_id?: string | null;
  hospital_name?: string | null;
  mfa_enabled?: boolean;
  is_active?: boolean;
}

export interface Donor {
  id: string;
  donor_code: string;
  organ: "kidney" | "liver" | "heart" | "lung" | "pancreas";
  blood_group: string;
  size_kg?: number | null;
  age_years?: number | null;
  status: "available" | "matched" | "transplanted" | "withdrawn";
  test_results: {
    crossmatch?: string;
    hla?: { A?: string[]; B?: string[]; DR?: string[] };
    creatinine_mg_dl?: number;
    [key: string]: unknown;
  };
  hospital_id: string;
  registered_by?: string;
  created_at: string;
}

export interface Recipient {
  id: string;
  recipient_code: string;
  organ: "kidney" | "liver" | "heart" | "lung" | "pancreas";
  blood_group: string;
  size_kg?: number | null;
  age_years?: number | null;
  urgency: number;
  status: "waiting" | "offered" | "transplanted" | "withdrawn" | "suspended";
  hla: { A?: string[]; B?: string[]; DR?: string[] };
  hospital_id: string;
  listed_at: string;
  created_at: string;
}

export interface MatchRunCandidate {
  rank: number;
  recipient_code: string;
  score: number;
  score_breakdown: {
    urgency?: number;
    hla?: number;
    waiting_time?: number;
    distance?: number;
    pediatric?: number;
  };
  reasons: string[];
}

export interface MatchRun {
  id: string;
  donor_code: string;
  rule_version_id: string;
  result_json: {
    donor_code: string;
    rule_version: string;
    ranked: MatchRunCandidate[];
    filtered_out?: string[];
    filter_reasons?: Record<string, string>;
  };
  created_at: string;
}

export interface Offer {
  id: string;
  match_run_id: string;
  recipient_code: string;
  rank: number;
  status: "pending" | "accepted" | "declined" | "expired" | "superseded";
  expires_at: string;
  responded_at?: string | null;
  reason?: string | null;
  created_at: string;
}

export interface Decision {
  id: string;
  offer_id: string;
  committee_user_id?: string | null;
  outcome: "approved" | "rejected" | "overridden";
  reason: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  time: string;
  actor_code: string;
  action: string;
  payload_hash: string;
  prev_hash: string;
  entry_hash: string;
  extra?: Record<string, unknown>;
}

export interface AuditVerifyResult {
  valid: boolean;
  entries_checked: number;
  first_bad_id?: string | null;
  message: string;
}

export interface FairnessReport {
  period_start: string;
  period_end: string;
  total_offers: number;
  total_accepted: number;
  acceptance_rate: number;
  average_waiting_days: number;
  by_urgency: Record<string, { offers: number; accepted: number }>;
  by_blood_group: Record<string, { offers: number; accepted: number }>;
}

export interface Hospital {
  id: string;
  name: string;
  region: string;
  verified: boolean;
  created_at: string;
}

export interface RuleVersion {
  id: string;
  organ: string;
  version_tag: string;
  weights_yaml_hash: string;
  approved_by?: string | null;
  effective_from: string;
  created_at: string;
}

export interface Paginated<T> {
  total: number;
  page: number;
  page_size: number;
  items: T[];
}

// ── API Methods ──────────────────────────────────────────────────
export const api = {
  // Health
  health: () => fetchWithAuth<{ status: string; env: string }>("/health"),

  // Auth
  auth: {
    login: (body: { email: string; password: string }) =>
      fetchWithAuth<
        | { access_token: string; refresh_token: string; token_type: string }
        | { mfa_pending_token: string; message: string }
      >("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    verifyMfa: (body: { mfa_pending_token: string; totp_code: string }) =>
      fetchWithAuth<{ access_token: string; refresh_token: string }>("/auth/mfa", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    refresh: (refreshToken: string) =>
      fetchWithAuth<{ access_token: string; refresh_token: string }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      }),
    setupTotp: () =>
      fetchWithAuth<{ totp_secret: string; totp_uri: string }>("/auth/totp/setup", {
        method: "POST",
      }),
    enableTotp: (totp_code: string) =>
      fetchWithAuth<{ message: string }>("/auth/totp/enable", {
        method: "POST",
        body: JSON.stringify({ totp_code }),
      }),
  },

  // Donors
  donors: {
    list: (params?: { page?: number; page_size?: number; organ?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));
      if (params?.organ) q.set("organ", params.organ);
      if (params?.status) q.set("status", params.status);
      return fetchWithAuth<Paginated<Donor>>(`/donors?${q.toString()}`);
    },
    get: (code: string) => fetchWithAuth<Donor>(`/donors/${code}`),
    create: (data: Partial<Donor>) =>
      fetchWithAuth<Donor>("/donors", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (code: string, data: { status?: string; test_results?: Record<string, unknown> }) =>
      fetchWithAuth<Donor>(`/donors/${code}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Recipients
  recipients: {
    list: (params?: { page?: number; page_size?: number; organ?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));
      if (params?.organ) q.set("organ", params.organ);
      if (params?.status) q.set("status", params.status);
      return fetchWithAuth<Paginated<Recipient>>(`/recipients?${q.toString()}`);
    },
    get: (code: string) => fetchWithAuth<Recipient>(`/recipients/${code}`),
    create: (data: Partial<Recipient>) =>
      fetchWithAuth<Recipient>("/recipients", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (code: string, data: { status?: string; urgency?: number; hla?: Record<string, unknown> }) =>
      fetchWithAuth<Recipient>(`/recipients/${code}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  // Matches
  matches: {
    run: (donor_code: string) =>
      fetchWithAuth<MatchRun>("/matches/run", {
        method: "POST",
        body: JSON.stringify({ donor_code }),
      }),
    get: (id: string) => fetchWithAuth<MatchRun>(`/matches/${id}`),
    list: (page = 1, page_size = 20) =>
      fetchWithAuth<Paginated<MatchRun>>(`/matches?page=${page}&page_size=${page_size}`),
  },

  // Offers
  offers: {
    list: (params?: { page?: number; page_size?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));
      if (params?.status) q.set("status", params.status);
      return fetchWithAuth<Paginated<Offer>>(`/offers?${q.toString()}`);
    },
    get: (id: string) => fetchWithAuth<Offer>(`/offers/${id}`),
    respond: (id: string, body: { response: "accepted" | "declined"; reason?: string }) =>
      fetchWithAuth<Offer>(`/offers/${id}/respond`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  // Decisions
  decisions: {
    list: (page = 1, page_size = 20) =>
      fetchWithAuth<Paginated<Decision>>(`/decisions?page=${page}&page_size=${page_size}`),
    get: (id: string) => fetchWithAuth<Decision>(`/decisions/${id}`),
    create: (body: { offer_id: string; outcome: "approved" | "rejected" | "overridden"; reason: string }) =>
      fetchWithAuth<Decision>("/decisions", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },

  // Identity Vault
  identity: {
    store: (data: { code: string; full_name: string; phone: string; address?: string; gov_id?: string }) =>
      fetchWithAuth<{ message: string }>("/identity/store", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    requestReveal: (code: string, reason: string) =>
      fetchWithAuth<{ id: string; code: string; status: string }>("/identity/reveal", {
        method: "POST",
        body: JSON.stringify({ code, reason }),
      }),
    approveReveal: (reveal_id: string, notes?: string) =>
      fetchWithAuth<{ id: string; status: string }>(`/identity/reveal/${reveal_id}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes }),
      }),
    getRevealStatus: (reveal_id: string) =>
      fetchWithAuth<{ id: string; code: string; status: string; requested_by: string; approved_by?: string }>(
        `/identity/reveal/${reveal_id}`
      ),
    getRevealedIdentity: (code: string) =>
      fetchWithAuth<{ code: string; full_name: string; phone: string; address?: string; gov_id?: string }>(
        `/identity/${code}`
      ),
  },

  // Audit
  audit: {
    list: (params?: { page?: number; page_size?: number; action?: string; actor_code?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set("page", String(params.page));
      if (params?.page_size) q.set("page_size", String(params.page_size));
      if (params?.action) q.set("action", params.action);
      if (params?.actor_code) q.set("actor_code", params.actor_code);
      return fetchWithAuth<Paginated<AuditLogEntry>>(`/audit?${q.toString()}`);
    },
    get: (id: string) => fetchWithAuth<AuditLogEntry>(`/audit/${id}`),
    verify: () => fetchWithAuth<AuditVerifyResult>("/audit/verify", { method: "POST" }),
  },

  // Reports
  reports: {
    fairness: (start?: string, end?: string) => {
      const q = new URLSearchParams();
      if (start) q.set("start", start);
      if (end) q.set("end", end);
      return fetchWithAuth<FairnessReport>(`/reports/fairness?${q.toString()}`);
    },
  },

  // Admin
  admin: {
    users: {
      list: (page = 1, page_size = 20) =>
        fetchWithAuth<Paginated<User>>(`/admin/users?page=${page}&page_size=${page_size}`),
      create: (data: { email: string; password: string; role: string; hospital_id?: string }) =>
        fetchWithAuth<User>("/admin/users", { method: "POST", body: JSON.stringify(data) }),
      get: (id: string) => fetchWithAuth<User>(`/admin/users/${id}`),
      update: (id: string, data: { role?: string; hospital_id?: string; is_active?: boolean }) =>
        fetchWithAuth<User>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    },
    hospitals: {
      list: (page = 1, page_size = 20) =>
        fetchWithAuth<Paginated<Hospital>>(`/admin/hospitals?page=${page}&page_size=${page_size}`),
      create: (data: { name: string; region: string }) =>
        fetchWithAuth<Hospital>("/admin/hospitals", { method: "POST", body: JSON.stringify(data) }),
      update: (id: string, data: { name?: string; region?: string; verified?: boolean }) =>
        fetchWithAuth<Hospital>(`/admin/hospitals/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    },
    ruleVersions: {
      list: (page = 1, page_size = 20) =>
        fetchWithAuth<Paginated<RuleVersion>>(`/admin/rule-versions?page=${page}&page_size=${page_size}`),
      create: (data: { organ: string; version_tag: string; weights_yaml_hash: string; effective_from: string }) =>
        fetchWithAuth<RuleVersion>("/admin/rule-versions", { method: "POST", body: JSON.stringify(data) }),
    },
  },
};
