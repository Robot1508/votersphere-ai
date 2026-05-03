import { describe, it, expect } from "vitest";
import { BALLOT_UNIT_MATERIAL, VVPAT_WINDOW_MATERIAL } from "../components/EVMScene";

// ── BallotUnit brushed-metal material assertions ──────────────────────────────
// Feature: votersphere-final-polish, Property 3 (materials): EVMScene material constraints
// Validates: Requirements 8.1, 8.2
describe("BALLOT_UNIT_MATERIAL — brushed-metal constraints", () => {
  it("metalness >= 0.85", () => {
    expect(BALLOT_UNIT_MATERIAL.metalness).toBeGreaterThanOrEqual(0.85);
  });

  it("roughness is in [0.3, 0.5] for brushed finish", () => {
    expect(BALLOT_UNIT_MATERIAL.roughness).toBeGreaterThanOrEqual(0.3);
    expect(BALLOT_UNIT_MATERIAL.roughness).toBeLessThanOrEqual(0.5);
  });

  it("color matches real EVM hardware (#d1d5db)", () => {
    expect(BALLOT_UNIT_MATERIAL.color).toBe("#d1d5db");
  });
});

// ── VVPAT window scratched-plastic material assertions ────────────────────────
// Validates: Requirements 9.1, 9.2
describe("VVPAT_WINDOW_MATERIAL — scratched-plastic constraints", () => {
  it("roughness >= 0.55 (scratched surface)", () => {
    expect(VVPAT_WINDOW_MATERIAL.roughness).toBeGreaterThanOrEqual(0.55);
  });

  it("transmission <= 0.5 (aged, not clear)", () => {
    expect(VVPAT_WINDOW_MATERIAL.transmission).toBeLessThanOrEqual(0.5);
  });

  it("clearcoat <= 0.15 (minimal specular)", () => {
    expect(VVPAT_WINDOW_MATERIAL.clearcoat).toBeLessThanOrEqual(0.15);
  });
});
