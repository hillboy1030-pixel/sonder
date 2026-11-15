// Server-only configuration shared by the API routes.

/** The Claude model that writes previews and reports. Override with SONDER_MODEL. */
export const AI_MODEL = process.env.SONDER_MODEL || "claude-sonnet-5-5";

/** Price of the full report, in cents. Keep in sync with lib/pricing.ts. */
export { REPORT_PRICE_CENTS } from "../pricing";

/** How many times one paid checkout can generate a report (covers retries). */
export const MAX_GENERATIONS_PER_PURCHASE = 3;

/** Paid checkouts older than this can no longer generate a new report. */
export const PURCHASE_VALID_DAYS = 30;

/**
 * Local development only: when SONDER_MOCK=1, the AI and Stripe are replaced by
 * sample data so the whole flow can be clicked through without keys or charges.
 * This is ignored in production builds (including Vercel previews).
 */
export const MOCK_MODE =
  process.env.NODE_ENV !== "production" && process.env.SONDER_MOCK === "1";

/** The site's public address, taken from the incoming request so preview deploys work. */
export function originFrom(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return fromEnv ?? "http://localhost:3000";
}
