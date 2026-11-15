import Anthropic from "@anthropic-ai/sdk";

/**
 * Turns an AI API failure into a message the visitor can act on, plus a short
 * code shown in small print so the site owner can tell what went wrong.
 */
export function aiErrorResponse(error: unknown): Response {
  const reply = (status: number, code: string, error: string) =>
    Response.json({ error, code }, { status });

  if (error instanceof Anthropic.APIError) {
    const msg = String((error as { message?: string }).message ?? "");
    if (/credit balance/i.test(msg) || error.status === 402) {
      console.error("[ai] Out of API credits. Add credits at platform.claude.com → Settings → Billing.");
      return reply(503, "ai_billing", "Sonder is resting for a moment. Please try again later.");
    }
    if (error.status === 401 || error.status === 403) {
      console.error("[ai] API key rejected. Check ANTHROPIC_API_KEY in Vercel.");
      return reply(500, "ai_auth", "Sonder couldn't start writing. Please try again later.");
    }
    if (error.status === 404) {
      console.error("[ai] Model not found. Check SONDER_MODEL / lib/server/config.ts.");
      return reply(500, "ai_model", "Sonder couldn't start writing. Please try again later.");
    }
    if (error.status === 429) {
      return reply(429, "ai_busy", "Sonder is busy right now. Wait 30 seconds, then try again.");
    }
    if (error.status && error.status >= 500) {
      return reply(503, "ai_down", "The writing service is briefly unavailable. Try again in a minute.");
    }
    return reply(500, `ai_${error.status ?? "error"}`, "Sonder couldn't start writing. Please try again in a few minutes.");
  }
  return reply(500, "ai_unknown", "Something interrupted the writing. Please try again.");
}
