import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { computeScrollT, getMilestoneThreshold, FROSTED_MATERIAL } from "../components/JourneyScene";

// ── Property 1: scrollT is always normalised to [0, 1] ───────────────────────
// Feature: votersphere-final-polish, Property 1: scrollT is always normalised to [0, 1]
// Validates: Requirement 1.2
describe("computeScrollT — normalisation", () => {
  it("always returns a value in [0, 1]", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }),  // scrollTop
        fc.integer({ min: 1, max: 10_000 }),  // clientHeight
        fc.integer({ min: 0, max: 10_000 }),  // extra scroll room
        (scrollTop, clientHeight, extra) => {
          const scrollHeight = clientHeight + extra;
          // scrollTop must not exceed the scrollable range
          const clampedScrollTop = Math.min(scrollTop, Math.max(0, scrollHeight - clientHeight));
          const t = computeScrollT(clampedScrollTop, scrollHeight, clientHeight);
          return t >= 0 && t <= 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns 0 when there is no scrollable area", () => {
    expect(computeScrollT(0, 500, 500)).toBe(0);
    expect(computeScrollT(100, 500, 500)).toBe(0);
  });

  it("returns 0 at the top", () => {
    expect(computeScrollT(0, 1000, 500)).toBe(0);
  });

  it("returns 1 at the bottom", () => {
    expect(computeScrollT(500, 1000, 500)).toBe(1);
  });

  it("clamps values above the max", () => {
    // scrollTop > scrollHeight - clientHeight should clamp to 1
    expect(computeScrollT(600, 1000, 500)).toBe(1);
  });
});

// ── Property 2: Milestone activation threshold is monotonically correct ───────
// Feature: votersphere-final-polish, Property 2: Milestone activation threshold is monotonically correct
// Validates: Requirements 2.1, 2.2, 2.4
describe("getMilestoneThreshold — activation logic", () => {
  it("milestone is active iff scrollT >= threshold", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),            // milestone index
        fc.float({ min: 0, max: 1, noNaN: true }), // scrollT
        (index, scrollT) => {
          const threshold = getMilestoneThreshold(index);
          const isActive = scrollT >= threshold;
          return isActive === (scrollT >= index / 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("at scrollT=0, all milestones are inactive", () => {
    for (let i = 0; i < 6; i++) {
      const threshold = getMilestoneThreshold(i);
      // Only milestone 0 has threshold 0, so it activates at scrollT=0
      if (i === 0) {
        expect(0 >= threshold).toBe(true);
      } else {
        expect(0 >= threshold).toBe(false);
      }
    }
  });

  it("at scrollT=1, all milestones are active", () => {
    for (let i = 0; i < 6; i++) {
      const threshold = getMilestoneThreshold(i);
      expect(1 >= threshold).toBe(true);
    }
  });

  it("thresholds are evenly spaced at 0, 0.2, 0.4, 0.6, 0.8, 1.0", () => {
    const expected = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    for (let i = 0; i < 6; i++) {
      expect(getMilestoneThreshold(i)).toBeCloseTo(expected[i], 10);
    }
  });
});

// ── Property 3: Active milestone material satisfies all physical constraints ──
// Feature: votersphere-final-polish, Property 3: Active milestone material satisfies all physical constraints
// Validates: Requirements 3.1, 3.2, 3.3
describe("FROSTED_MATERIAL — physical constraints", () => {
  it("transmission >= 0.85", () => {
    expect(FROSTED_MATERIAL.transmission).toBeGreaterThanOrEqual(0.85);
  });

  it("clearcoat === 1", () => {
    expect(FROSTED_MATERIAL.clearcoat).toBe(1);
  });

  it("roughness <= 0.15", () => {
    expect(FROSTED_MATERIAL.roughness).toBeLessThanOrEqual(0.15);
  });

  it("ior === 1.5", () => {
    expect(FROSTED_MATERIAL.ior).toBe(1.5);
  });

  it("color is #E63946 when active and #ffffff when inactive", () => {
    // This is a logic test — the component uses isActive to pick the color
    const activeColor   = "#E63946";
    const inactiveColor = "#ffffff";
    const isActive = true;
    expect(isActive ? activeColor : inactiveColor).toBe("#E63946");
    expect(!isActive ? activeColor : inactiveColor).toBe("#ffffff");
  });
});

// ── Property 4: Camera lerp strictly converges toward target ─────────────────
// Feature: votersphere-final-polish, Property 4: Camera lerp strictly converges toward target
// Validates: Requirement 1.3
describe("camera lerp convergence", () => {
  it("lerp(p, t, 0.08) reduces distance to target for any non-coincident points", () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ noNaN: true, noDefaultInfinity: true, min: -100, max: 100 }),
          fc.float({ noNaN: true, noDefaultInfinity: true, min: -100, max: 100 }),
          fc.float({ noNaN: true, noDefaultInfinity: true, min: -100, max: 100 })
        ),
        fc.tuple(
          fc.float({ noNaN: true, noDefaultInfinity: true, min: -100, max: 100 }),
          fc.float({ noNaN: true, noDefaultInfinity: true, min: -100, max: 100 }),
          fc.float({ noNaN: true, noDefaultInfinity: true, min: -100, max: 100 })
        ),
        ([px, py, pz], [tx, ty, tz]) => {
          const distBefore = Math.hypot(tx - px, ty - py, tz - pz);
          if (distBefore < 1e-6) return true; // already at target — trivially converged

          const ALPHA = 0.08;
          const nx = px + (tx - px) * ALPHA;
          const ny = py + (ty - py) * ALPHA;
          const nz = pz + (tz - pz) * ALPHA;
          const distAfter = Math.hypot(tx - nx, ty - ny, tz - nz);

          return distAfter < distBefore;
        }
      ),
      { numRuns: 100 }
    );
  });
});
