import { describe, it, expect, beforeEach } from "vitest";
import { hasRequiredRole, ROLE_LABELS } from "../lib/auth";

describe("Auth Utilities", () => {
  describe("hasRequiredRole", () => {
    it("returns true if user is admin, regardless of allowed list", () => {
      expect(hasRequiredRole("admin", ["doctor"])).toBe(true);
      expect(hasRequiredRole("admin", ["coordinator", "auditor"])).toBe(true);
    });

    it("returns true if user has an allowed role", () => {
      expect(hasRequiredRole("doctor", ["doctor", "coordinator"])).toBe(true);
      expect(hasRequiredRole("coordinator", ["doctor", "coordinator"])).toBe(true);
      expect(hasRequiredRole("auditor", ["auditor"])).toBe(true);
    });

    it("returns false if user does not have an allowed role", () => {
      expect(hasRequiredRole("doctor", ["auditor", "committee"])).toBe(false);
      expect(hasRequiredRole(undefined, ["doctor"])).toBe(false);
    });
  });

  describe("ROLE_LABELS", () => {
    it("contains descriptive labels for all system roles", () => {
      expect(ROLE_LABELS.doctor).toBe("Transplant Doctor");
      expect(ROLE_LABELS.coordinator).toBe("Hospital Coordinator");
      expect(ROLE_LABELS.committee).toBe("Transplant Committee");
      expect(ROLE_LABELS.auditor).toBe("Independent Auditor");
      expect(ROLE_LABELS.authority).toBe("State / National Authority");
      expect(ROLE_LABELS.admin).toBe("System Administrator");
    });
  });
});
