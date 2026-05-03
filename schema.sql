-- VoterSphere — PostgreSQL schema
-- Run: psql $DATABASE_URL -f schema.sql

-- Civic credits ledger (append-only — each event is an immutable row)
CREATE TABLE IF NOT EXISTS civic_credits (
  id          BIGSERIAL    PRIMARY KEY,
  user_id     TEXT         NOT NULL,
  delta       INTEGER      NOT NULL CHECK (delta > 0 AND delta <= 1000),
  badge       TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for fast per-user aggregation (used by GET /api/credits)
CREATE INDEX IF NOT EXISTS idx_civic_credits_user_id
  ON civic_credits (user_id);
