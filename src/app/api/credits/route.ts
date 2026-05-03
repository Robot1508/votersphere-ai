import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { postCreditsWithPool, getCreditsWithPool } from "@/lib/credits-core";
import { checkRateLimit } from "@/lib/rate-limit";

// Re-export for backward compatibility with any existing imports
export { postCreditsWithPool, getCreditsWithPool };

// ── Route handlers ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = "anonymous", delta = 10, badge = null } = body as {
      userId?: string;
      delta?: number;
      badge?: string | null;
    };

    // Rate limit: max 10 POST requests per userId per minute
    const rl = checkRateLimit(`credits:${userId}`, { windowMs: 60_000, maxRequests: 10 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests — please wait before earning more credits." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rl.resetAt),
          },
        }
      );
    }

    // Validate delta — reject <= 0 or > 1000 (Req 12.1)
    if (typeof delta !== "number" || delta <= 0 || delta > 1000) {
      return NextResponse.json({ error: "Invalid delta value" }, { status: 400 });
    }

    const result = await postCreditsWithPool(pool, userId, delta, badge);
    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Remaining": String(rl.remaining),
        "X-RateLimit-Reset": String(rl.resetAt),
      },
    });
  } catch (err) {
    console.error("[POST /api/credits]", err);
    // 503 on connection failure — no silent fallback to in-memory state (Req 12.4)
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? "anonymous";
  try {
    const credits = await getCreditsWithPool(pool, userId);
    return NextResponse.json({ userId, credits });
  } catch (err) {
    console.error("[GET /api/credits]", err);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}
