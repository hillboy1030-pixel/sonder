import Anthropic from "@anthropic-ai/sdk";

/** Turns an AI API failure into a message the visitor can act on. */
export function aiErrorResponse(error: unknown): Response {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 429) {
      return Response.json({ error: "Sonder is busy right now. Wait 30 seconds, then try again." }, { status: 429 });
    }
    if (error.status && error.status >= 500) {
      return Response.json({ error: "The writing service is briefly unavailable. Try again in a minute." }, { status: 503 });
    }
    // 401/402/403/404: our configuration problem, not the visitor's.
    return Response.json({ error: "Sonder couldn't start writing. Please try again in a few minutes, or email us if it keeps happening." }, { status: 500 });
  }
  return Response.json({ error: "Something interrupted the writing. Please try again." }, { status: 500 });
}
