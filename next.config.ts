import type { NextConfig } from "next";

// Run environment validation at build time in production.
// Skip during `next dev` so developers can start without a database configured.
// Uses a synchronous check to avoid top-level await (not supported in next.config.ts).
if (process.env.NODE_ENV === "production") {
  const REQUIRED = ["DATABASE_URL"] as const;
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `\n\n🚨  VoterSphere: Missing required environment variables:\n` +
        missing.map((k) => `  ✗ ${k}`).join("\n") +
        `\n\nSet these in your deployment environment before building.\n`
    );
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn("\n⚠  VoterSphere: GEMINI_API_KEY not set — Neta-GPT AI responses will be degraded.\n");
  }
}

const nextConfig: NextConfig = {
  // Silence the workspace-root lockfile warning (monorepo setup)
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
