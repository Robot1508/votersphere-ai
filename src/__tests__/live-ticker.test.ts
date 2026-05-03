import { describe, it, expect } from "vitest";
import { mockHeadlines, TICKER_DURATION, ART_324, ART_326 } from "../components/NetaGPT";

// ── Property 10: Live Ticker headlines are distinct and sufficient ─────────────
// Feature: votersphere-final-polish, Property 10: Live Ticker headlines are distinct and sufficient
// Validates: Requirement 11.2
describe("mockHeadlines — count and uniqueness", () => {
  it("has at least 5 distinct headlines", () => {
    expect(mockHeadlines.length).toBeGreaterThanOrEqual(5); // ✓ Req 11.2
  });

  it("all headlines are unique strings", () => {
    const unique = new Set(mockHeadlines);
    expect(unique.size).toBe(mockHeadlines.length); // ✓ no duplicates
  });

  it("all headlines are non-empty strings", () => {
    for (const h of mockHeadlines) {
      expect(typeof h).toBe("string");
      expect(h.trim().length).toBeGreaterThan(0);
    }
  });
});

// ── Ticker animation config ───────────────────────────────────────────────────
// Validates: Requirement 11.3
describe("TICKER_DURATION — animation config", () => {
  it("duration is >= 25 seconds so headlines are readable", () => {
    expect(TICKER_DURATION).toBeGreaterThanOrEqual(25); // ✓ Req 11.3
  });
});

// ── Article fullText presence ─────────────────────────────────────────────────
// Validates: Requirement 10.5
describe("ART_324 and ART_326 — fullText presence", () => {
  it("ART_324 has a non-empty fullText", () => {
    expect(typeof ART_324.fullText).toBe("string");
    expect((ART_324.fullText ?? "").trim().length).toBeGreaterThan(0); // ✓ Req 10.5
  });

  it("ART_326 has a non-empty fullText", () => {
    expect(typeof ART_326.fullText).toBe("string");
    expect((ART_326.fullText ?? "").trim().length).toBeGreaterThan(0); // ✓ Req 10.5
  });

  it("ART_324 fullText mentions Election Commission", () => {
    expect(ART_324.fullText).toContain("Election Commission");
  });

  it("ART_326 fullText mentions adult suffrage or citizen", () => {
    const text = ART_326.fullText ?? "";
    expect(text.toLowerCase()).toMatch(/citizen|suffrage|eighteen/);
  });
});
