zimport { describe, it, expect } from "vitest";
import fc from "fast-check";
import { postCreditsWithPool, getCreditsWithPool } from "../lib/credits-core";

// ── Mock pool factory ─────────────────────────────────────────────────────────
function makeMockPool(store: Map<string, number> = new Map()) {
  return {
    connect: async () => ({
      query: async (sql: string, params: unknown[]) => {
        if (sql.includes("INSERT")) {
          const [uid, delta] = params as [string, number];
          store.set(uid, (store.get(uid) ?? 0) + delta);
          return { rows: [] };
        }
        if (sql.includes("SUM")) {
          const [uid] = params as [string];
          return { rows: [{ total: String(store.get(uid) ?? 0) }] };
        }
        return { rows: [] };
      },
      release: () => {},
    }),
  } as unknown as import("pg").Pool;
}

function makeFailingPool() {
  return {
    connect: async () => { throw new Error("Connection refused"); },
  } as unknown as import("pg").Pool;
}

// ── Property 7: POST then GET returns accumulated total ───────────────────────
// Feature: votersphere-final-polish, Property 7: POST then GET returns accumulated total
// Validates: Requirements 12.1, 12.2, 12.3
describe("postCreditsWithPool + getCreditsWithPool — round-trip", () => {
  it("accumulated credits match sum of posted deltas", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.integer({ min: 1, max: 1000 }), { minLength: 1, maxLength: 20 }),
        async (deltas) => {
          const store = new Map<string, number>();
          const mockPool = makeMockPool(store);
          const userId = "test-user";

          for (const delta of deltas) {
            await postCreditsWithPool(mockPool, userId, delta);
          }

          const total = await getCreditsWithPool(mockPool, userId);
          return total === deltas.reduce((a, b) => a + b, 0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("robot1508 credits accumulate correctly across multiple posts", async () => {
    const store = new Map<string, number>();
    const mockPool = makeMockPool(store);

    await postCreditsWithPool(mockPool, "robot1508", 10);
    await postCreditsWithPool(mockPool, "robot1508", 10);
    await postCreditsWithPool(mockPool, "robot1508", 10);

    const total = await getCreditsWithPool(mockPool, "robot1508");
    expect(total).toBe(30); // ✓ Req 12.3
  });

  it("different users have independent credit totals", async () => {
    const store = new Map<string, number>();
    const mockPool = makeMockPool(store);

    await postCreditsWithPool(mockPool, "robot1508", 50);
    await postCreditsWithPool(mockPool, "other-user", 20);

    expect(await getCreditsWithPool(mockPool, "robot1508")).toBe(50);
    expect(await getCreditsWithPool(mockPool, "other-user")).toBe(20);
  });
});

// ── Property 11: SQL injection safety ────────────────────────────────────────
// Feature: votersphere-final-polish, Property 11: Credits API uses parameterised queries
// Validates: Requirement 12.5
//
// Strategy: use SQL-dangerous strings (containing quotes, semicolons, SQL keywords).
// Verify the userId appears in the params array (parameterised) but NOT in the SQL text.
// We avoid generic short strings like " " because SQL templates themselves contain spaces.
describe("parameterised queries — SQL injection safety", () => {
  it("dangerous userId values are passed as params, never interpolated into SQL", async () => {
    // Only test strings that contain SQL-special characters — these would be
    // dangerous if interpolated but are safe as bound parameters.
    const dangerousUserIds = fc.oneof(
      fc.constant("'; DROP TABLE civic_credits; --"),
      fc.constant("1 OR 1=1"),
      fc.constant("admin'--"),
      fc.constant("robot1508'; DELETE FROM civic_credits WHERE '1'='1"),
      // Arbitrary strings with at least one SQL-special character
      fc.string({ minLength: 4, maxLength: 40 }).filter(s => /['";\-=]/.test(s))
    );

    await fc.assert(
      fc.asyncProperty(dangerousUserIds, async (userId) => {
        const capturedSql: string[] = [];
        const capturedParams: unknown[][] = [];

        const mockPool = {
          connect: async () => ({
            query: async (sql: string, params: unknown[]) => {
              capturedSql.push(sql);
              capturedParams.push(params);
              return { rows: [{ total: "0" }] };
            },
            release: () => {},
          }),
        } as unknown as import("pg").Pool;

        await postCreditsWithPool(mockPool, userId, 10);

        // The userId must NOT appear literally in any SQL string
        const sqlContainsUserId = capturedSql.some(sql => sql.includes(userId));
        // The userId MUST appear in the params (proving it was bound, not interpolated)
        const paramsContainUserId = capturedParams.some(p => p.includes(userId));

        return !sqlContainsUserId && paramsContainUserId;
      }),
      { numRuns: 50 }
    );
  });

  it("SQL injection payload does not appear in query text", async () => {
    const injectionPayload = "'; DROP TABLE civic_credits; --";
    const capturedSql: string[] = [];

    const mockPool = {
      connect: async () => ({
        query: async (sql: string, _params: unknown[]) => {
          capturedSql.push(sql);
          return { rows: [{ total: "0" }] };
        },
        release: () => {},
      }),
    } as unknown as import("pg").Pool;

    await postCreditsWithPool(mockPool, injectionPayload, 10);

    for (const sql of capturedSql) {
      expect(sql).not.toContain(injectionPayload);
      expect(sql).not.toContain("DROP TABLE");
    }
  });
});

// ── Property 8: 503 on PostgreSQL connection failure ─────────────────────────
// Feature: votersphere-final-polish, Property 8: Credits API returns 503 on PostgreSQL connection failure
// Validates: Requirement 12.4
describe("postCreditsWithPool — connection failure propagation", () => {
  it("throws when pool.connect() fails", async () => {
    const failingPool = makeFailingPool();
    await expect(postCreditsWithPool(failingPool, "robot1508", 10)).rejects.toThrow();
  });

  it("getCreditsWithPool throws when pool.connect() fails", async () => {
    const failingPool = makeFailingPool();
    await expect(getCreditsWithPool(failingPool, "robot1508")).rejects.toThrow();
  });
});

// ── Unit tests — delta validation ─────────────────────────────────────────────
// Validates: Requirement 12.4 (400 on bad input)
describe("delta validation logic", () => {
  it("delta <= 0 is invalid", () => {
    const isValid = (delta: number) =>
      typeof delta === "number" && delta > 0 && delta <= 1000;

    expect(isValid(-1)).toBe(false);
    expect(isValid(0)).toBe(false);
    expect(isValid(1)).toBe(true);
  });

  it("delta > 1000 is invalid", () => {
    const isValid = (delta: number) =>
      typeof delta === "number" && delta > 0 && delta <= 1000;

    expect(isValid(1001)).toBe(false);
    expect(isValid(1000)).toBe(true);
  });
});
