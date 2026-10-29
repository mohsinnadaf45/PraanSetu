import {
  Donor,
  Recipient,
  MatchRun,
  Offer,
  AuditLogEntry,
  FairnessReport,
  Hospital,
  RuleVersion,
  User,
  Paginated,
} from "./api-client";

export function createDemoJwtToken(email: string, role: string = "admin"): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: "usr_demo_" + Math.random().toString(36).substring(2, 9),
      email,
      role,
      hospital_id: "hosp_aiims_01",
      exp: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
      type: "access",
    })
  );
  const signature = btoa("praansetu_client_demo_signature");
  return `${header}.${payload}.${signature}`;
}

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "hosp_aiims_01",
    name: "AIIMS New Delhi",
    region: "Delhi NCR",
    verified: true,
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: "hosp_pgi_02",
    name: "PGIMER Chandigarh",
    region: "North Region",
    verified: true,
    created_at: new Date(Date.now() - 86400000 * 80).toISOString(),
  },
  {
    id: "hosp_kmc_03",
    name: "King Edward Memorial Hospital Mumbai",
    region: "West Region",
    verified: true,
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];

export const MOCK_DONORS: Donor[] = [
  {
    id: "dn_001",
    donor_code: "DN-2026-0811",
    organ: "kidney",
    blood_group: "O+",
    size_kg: 68,
    age_years: 34,
    status: "available",
    hospital_id: "hosp_aiims_01",
    registered_by: "Dr. A. Sharma",
    test_results: {
      crossmatch: "negative",
      hla: { A: ["02", "24"], B: ["35", "44"], DR: ["04", "11"] },
      creatinine_mg_dl: 1.1,
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "dn_002",
    donor_code: "DN-2026-0812",
    organ: "liver",
    blood_group: "A+",
    size_kg: 72,
    age_years: 29,
    status: "matched",
    hospital_id: "hosp_pgi_02",
    registered_by: "Dr. K. Patel",
    test_results: {
      bilirubin_mg_dl: 0.9,
      alt_ast_ratio: 1.0,
      hla: { A: ["01", "03"], B: ["08", "07"], DR: ["03", "15"] },
    },
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "dn_003",
    donor_code: "DN-2026-0813",
    organ: "heart",
    blood_group: "B+",
    size_kg: 62,
    age_years: 24,
    status: "available",
    hospital_id: "hosp_kmc_03",
    registered_by: "Dr. R. Nair",
    test_results: {
      ejection_fraction: 65,
      ischemia_time_est_hours: 3.5,
    },
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

export const MOCK_RECIPIENTS: Recipient[] = [
  {
    id: "rc_001",
    recipient_code: "RC-2026-4401",
    organ: "kidney",
    blood_group: "O+",
    size_kg: 65,
    age_years: 38,
    urgency: 4,
    status: "waiting",
    hospital_id: "hosp_aiims_01",
    hla: { A: ["02", "24"], B: ["35", "07"], DR: ["04", "15"] },
    listed_at: new Date(Date.now() - 86400000 * 240).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 240).toISOString(),
  },
  {
    id: "rc_002",
    recipient_code: "RC-2026-4402",
    organ: "kidney",
    blood_group: "O+",
    size_kg: 70,
    age_years: 52,
    urgency: 3,
    status: "waiting",
    hospital_id: "hosp_pgi_02",
    hla: { A: ["02", "01"], B: ["44", "08"], DR: ["11", "03"] },
    listed_at: new Date(Date.now() - 86400000 * 180).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
  },
  {
    id: "rc_003",
    recipient_code: "RC-2026-4403",
    organ: "heart",
    blood_group: "B+",
    size_kg: 64,
    age_years: 31,
    urgency: 5,
    status: "offered",
    hospital_id: "hosp_kmc_03",
    hla: { A: ["03", "11"], B: ["35", "51"], DR: ["07", "09"] },
    listed_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: "off_001",
    match_run_id: "mr_001",
    recipient_code: "RC-2026-4403",
    rank: 1,
    status: "pending",
    expires_at: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "off_002",
    match_run_id: "mr_002",
    recipient_code: "RC-2026-4401",
    rank: 1,
    status: "accepted",
    expires_at: new Date(Date.now() - 3600000).toISOString(),
    responded_at: new Date(Date.now() - 5400000).toISOString(),
    reason: "Clinical suitability confirmed by transplant team",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const MOCK_MATCH_RUNS: MatchRun[] = [
  {
    id: "mr_001",
    donor_code: "DN-2026-0811",
    rule_version_id: "rv_kidney_v1",
    result_json: {
      donor_code: "DN-2026-0811",
      rule_version: "v1.2-notto-std",
      ranked: [
        {
          rank: 1,
          recipient_code: "RC-2026-4401",
          score: 88.5,
          score_breakdown: {
            urgency: 35.0,
            hla: 28.5,
            waiting_time: 15.0,
            distance: 10.0,
          },
          reasons: ["Full ABO compatibility", "5/6 HLA Antigen Match", "High urgency score"],
        },
        {
          rank: 2,
          recipient_code: "RC-2026-4402",
          score: 74.2,
          score_breakdown: {
            urgency: 25.0,
            hla: 24.2,
            waiting_time: 15.0,
            distance: 10.0,
          },
          reasons: ["Full ABO compatibility", "4/6 HLA Antigen Match"],
        },
      ],
      filtered_out: ["RC-2026-4499"],
      filter_reasons: { "RC-2026-4499": "Positive virtual crossmatch (DSA identified)" },
    },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud_001",
    time: new Date(Date.now() - 3600000 * 2).toISOString(),
    actor_code: "ACT-ADMIN-01",
    action: "MATCH_RUN_EXECUTED",
    payload_hash: "3b2e5971a81dc4f37477b31278ffc0c99fcf60759f20c4f8260daef894a4c64d",
    prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    entry_hash: "7fa84f8812e1762c9c22956de6dd1972f444ce6992d194fc894f068c2d1b8c19",
    extra: { donor_code: "DN-2026-0811", ranked_count: 2 },
  },
  {
    id: "aud_002",
    time: new Date(Date.now() - 3600000 * 1).toISOString(),
    actor_code: "ACT-DOC-02",
    action: "OFFER_DISPATCHED",
    payload_hash: "82bc3322aa18bf0e1811a01b63e8a3a31c554e2f98106a7cd7bf3ef9f50e9f1a",
    prev_hash: "7fa84f8812e1762c9c22956de6dd1972f444ce6992d194fc894f068c2d1b8c19",
    entry_hash: "e44d32a9018c6422b467e91bb6f4f227181079bc20d4f18376483cb1d43f07a2",
    extra: { offer_id: "off_001", recipient: "RC-2026-4403" },
  },
];

export const MOCK_FAIRNESS_REPORT: FairnessReport = {
  period_start: new Date(Date.now() - 86400000 * 30).toISOString(),
  period_end: new Date().toISOString(),
  total_offers: 124,
  total_accepted: 98,
  acceptance_rate: 79.03,
  average_waiting_days: 142.5,
  by_urgency: {
    "Level 5 (Critical)": { offers: 32, accepted: 30 },
    "Level 4 (High)": { offers: 48, accepted: 41 },
    "Level 3 (Standard)": { offers: 44, accepted: 27 },
  },
  by_blood_group: {
    "O+": { offers: 45, accepted: 38 },
    "A+": { offers: 38, accepted: 30 },
    "B+": { offers: 26, accepted: 20 },
    "AB+": { offers: 15, accepted: 10 },
  },
};

export const MOCK_RULE_VERSIONS: RuleVersion[] = [
  {
    id: "rv_kidney_v1",
    organ: "kidney",
    version_tag: "v1.2-notto-std",
    weights_yaml_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    approved_by: "NOTTO Technical Advisory Board",
    effective_from: new Date(Date.now() - 86400000 * 180).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 180).toISOString(),
  },
];
