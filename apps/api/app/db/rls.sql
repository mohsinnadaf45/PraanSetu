-- Row-Level Security policies for the main PostgreSQL database.
-- Run once during initial setup after tables are created.

-- ── Enable RLS ──────────────────────────────────────────────

ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipient ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ── Audit log: append-only (no UPDATE/DELETE) ────────────────
CREATE POLICY audit_log_insert_only ON audit_log
    FOR INSERT WITH CHECK (true);

-- Block all UPDATE on audit_log
CREATE RULE audit_log_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;

-- Block all DELETE on audit_log
CREATE RULE audit_log_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;

-- ── Application role (used by the API connection) ────────────
-- Grant SELECT/INSERT on audit_log but NOT UPDATE/DELETE
-- (enforced by rules above as a second layer)
-- GRANT SELECT, INSERT ON audit_log TO praansetu_api;

-- ── Hospital-scoped read: doctors/coordinators only see their hospital ──
-- The API sets app.current_hospital_id and app.current_role at session start.

CREATE POLICY donor_hospital_scope ON donor
    USING (
        current_setting('app.current_role', true) IN ('admin', 'auditor', 'authority')
        OR hospital_id::text = current_setting('app.current_hospital_id', true)
    );

CREATE POLICY recipient_hospital_scope ON recipient
    USING (
        current_setting('app.current_role', true) IN ('admin', 'auditor', 'authority')
        OR hospital_id::text = current_setting('app.current_hospital_id', true)
    );
