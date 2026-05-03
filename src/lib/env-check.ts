/**
 * env-check.ts
 * Run during build (imported by next.config.ts) to verify required environment
 * variables are present. Throws a fatal error so the build fails loudly rather
 * than deploying a broken app.
 */

const REQUIRED_ENV_VARS = [
  {
    key: "DATABASE_URL",
    hint: "PostgreSQL connection string — e.g. postgresql://user:pass@host:5432/db",
  },
] as const;

// GEMINI_API_KEY is optional at build time (only needed at runtime for Neta-GPT)
// but we warn if it is absent so the operator knows the AI feature will be degraded.
const OPTIONAL_ENV_VARS = [
  {
    key: "GEMINI_API_KEY",
    hint: "Google Gemini API key — required for Neta-GPT constitutional AI responses",
  },
] as const;

export function checkEnv(): void {
  const missing: string[] = [];

  for (const { key, hint } of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(`  ✗ ${key}\n    → ${hint}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `\n\n🚨  VoterSphere: Missing required environment variables:\n\n` +
        missing.join("\n\n") +
        `\n\nSet these in your .env.local file or deployment environment before building.\n`
    );
  }

  // Warn (not fatal) for optional vars
  for (const { key, hint } of OPTIONAL_ENV_VARS) {
    if (!process.env[key]) {
      console.warn(`\n⚠  VoterSphere: Optional env var not set: ${key}\n   → ${hint}\n`);
    }
  }
}
