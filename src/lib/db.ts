import { Pool } from "pg";

// ── pg Pool singleton ─────────────────────────────────────────────────────────
// Next.js hot-reload in development creates new module instances on each file
// change. Without the globalThis guard, each reload opens a new pool and
// exhausts the PostgreSQL connection limit quickly.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool: Pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

// ── Table initialisation ──────────────────────────────────────────────────────
// Called once at startup (or lazily on first request) to ensure the table
// exists. Safe to call multiple times — uses IF NOT EXISTS.
export async function ensureTable(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS civic_credits (
        id          BIGSERIAL    PRIMARY KEY,
        user_id     TEXT         NOT NULL,
        delta       INTEGER      NOT NULL CHECK (delta > 0 AND delta <= 1000),
        badge       TEXT,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_civic_credits_user_id
        ON civic_credits (user_id);
    `);
  } finally {
    client.release();
  }
}
