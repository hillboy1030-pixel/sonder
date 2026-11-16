// Simple per-visitor rate limits for the routes that cost money (AI calls,
// Stripe sessions). Counts live in memory on each server instance, so this
// stops scripted abuse from one address quickly; the hard ceiling on AI spend
// is the monthly limit set in the Anthropic console.

import type { NextRequest } from "next/server";

type Rule = { limit: number; windowMs: number };

export const LIMITS = {
  // Generous enough for a family sharing one wifi connection.
  preview: [
    { limit: 20, windowMs: 60 * 60 * 1000 },
    { limit: 40, windowMs: 24 * 60 * 60 * 1000 },
  ],
  report: [{ limit: 20, windowMs: 60 * 60 * 1000 }],
  checkout: [{ limit: 30, windowMs: 60 * 60 * 1000 }],
  journal: [{ limit: 12, windowMs: 60 * 60 * 1000 }],
} satisfies Record<string, Rule[]>;

const hits = new Map<string, number[]>();
let lastSweep = Date.now();

function visitorFrom(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip") ?? "unknown").trim();
}

function sweep(now: number) {
  if (now - lastSweep < 10 * 60 * 1000) return;
  lastSweep = now;
  for (const [key, times] of hits) {
    const fresh = times.filter((t) => now - t < 24 * 60 * 60 * 1000);
    if (fresh.length) hits.set(key, fresh);
    else hits.delete(key);
  }
}

/** True if the request comes from another website (scripts calling our API from elsewhere). */
function crossSite(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false; // same-origin fetches and server tools may omit it
  try {
    return new URL(origin).host !== request.headers.get("host");
  } catch {
    return true;
  }
}

/**
 * Returns a 429/403 Response when the visitor is over the limit for this route,
 * or null when the request may go ahead (and counts it).
 */
export function limitRequest(request: NextRequest, route: keyof typeof LIMITS): Response | null {
  if (crossSite(request)) {
    return Response.json({ error: "Requests must come from Sonder." }, { status: 403 });
  }
  const now = Date.now();
  sweep(now);
  const key = `${route}:${visitorFrom(request)}`;
  const times = hits.get(key) ?? [];
  for (const rule of LIMITS[route]) {
    const recent = times.filter((t) => now - t < rule.windowMs).length;
    if (recent >= rule.limit) {
      return Response.json(
        { error: "You've tried this a lot in a short time. Please wait a little and try again.", code: "rate_limited" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rule.windowMs / 1000 / 4)) } }
      );
    }
  }
  times.push(now);
  hits.set(key, times);
  return null;
}
