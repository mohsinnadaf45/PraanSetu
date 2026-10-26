import { describe, it, expect } from "vitest";
import {
  formatOrganName,
  getUrgencyInfo,
  formatTimeRemaining,
  formatDateTime,
  formatRelativeTime,
} from "../lib/formatters";

describe("Clinical Formatters", () => {
  describe("formatOrganName", () => {
    it("capitalizes organ names properly", () => {
      expect(formatOrganName("kidney")).toBe("Kidney");
      expect(formatOrganName("liver")).toBe("Liver");
      expect(formatOrganName("heart")).toBe("Heart");
      expect(formatOrganName("lung")).toBe("Lung");
      expect(formatOrganName("pancreas")).toBe("Pancreas");
      expect(formatOrganName(undefined)).toBe("Unknown");
    });
  });

  describe("getUrgencyInfo", () => {
    it("returns correct priority level metadata", () => {
      const tier1 = getUrgencyInfo(5);
      expect(tier1.label).toContain("Critical");

      const tier2 = getUrgencyInfo(4);
      expect(tier2.label).toContain("Urgent");

      const tier5 = getUrgencyInfo(1);
      expect(tier5.label).toContain("Elective");
    });
  });

  describe("formatTimeRemaining", () => {
    it("identifies past dates as expired", () => {
      const past = new Date(Date.now() - 10000).toISOString();
      const res = formatTimeRemaining(past);
      expect(res.isExpired).toBe(true);
      expect(res.formatted).toBe("Expired");
    });

    it("calculates positive remaining countdown for future dates", () => {
      const future = new Date(Date.now() + 3600 * 1000 * 2 + 15 * 60 * 1000).toISOString();
      const res = formatTimeRemaining(future);
      expect(res.isExpired).toBe(false);
      expect(res.hours).toBe(2);
      expect(res.minutes).toBe(15);
      expect(res.formatted).toMatch(/\d{2}h \d{2}m \d{2}s/);
    });
  });

  describe("formatDateTime", () => {
    it("formats ISO string gracefully", () => {
      const iso = "2026-05-10T14:30:00Z";
      const formatted = formatDateTime(iso);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe("string");
      expect(formatDateTime(null)).toBe("—");
    });
  });
});
