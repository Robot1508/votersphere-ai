// ── Testable core functions ───────────────────────────────────────────────────
// These functions accept a pool-like argument so they can be tested with a
// mock pool without importing pg or Next.js route infrastructure.
//
// The route handlers in /api/credits/route.ts call these with the real pool.

export interface PoolLike {
  connect(): Promise<ClientLike>;
}

export interface ClientLike {
  query<T = { rows: unknown[] }>(sql: string, params?: unknown[]): Promise<{ rows: T extends { rows: infer R } ? R : unknown[] }>;
  release(): void;
}

export async function postCreditsWithPool(
  db: PoolLike,
  userId: string,
  delta: number,
  badge: string | null = null
): Promise<{
  userId: string;
  previousCredits: number;
  currentCredits: number;
  delta: number;
  badgesEarned: string[];
}> {
  const client = await db.connect();
  try {
    // Append-only ledger — each credit event is an immutable row (Req 12.1)
    // Parameterised query — no string interpolation of user values (Req 12.5)
    await client.query(
      `INSERT INTO civic_credits (user_id, delta, badge, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [userId, delta, badge]
    );

    // Aggregate total for badge threshold checks (Req 12.2)
    const result = await client.query<{ total: string }>(
      `SELECT COALESCE(SUM(delta), 0)::text AS total
       FROM civic_credits
       WHERE user_id = $1`,
      [userId]
    );
    const rows = result.rows as { total: string }[];
    const currentCredits  = parseInt(rows[0].total, 10);
    const previousCredits = currentCredits - delta;

    // Badge thresholds
    const earned: string[] = [];
    if (previousCredits < 50  && currentCredits >= 50)  earned.push("first-vote");
    if (previousCredits < 100 && currentCredits >= 100) earned.push("civic-scholar");
    if (previousCredits < 500 && currentCredits >= 500) earned.push("democracy-guardian");
    if (badge && !earned.includes(badge)) earned.push(badge);

    return { userId, previousCredits, currentCredits, delta, badgesEarned: earned };
  } finally {
    client.release();
  }
}

export async function getCreditsWithPool(
  db: PoolLike,
  userId: string
): Promise<number> {
  const client = await db.connect();
  try {
    const result = await client.query<{ total: string }>(
      `SELECT COALESCE(SUM(delta), 0)::text AS total
       FROM civic_credits
       WHERE user_id = $1`,
      [userId]
    );
    const rows = result.rows as { total: string }[];
    return parseInt(rows[0].total, 10);
  } finally {
    client.release();
  }
}
