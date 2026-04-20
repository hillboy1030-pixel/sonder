import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

// Fast call — generates only the 3 preview insight cards (~15–25s)
export const maxDuration = 60;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Sonder's preview engine. Your job is to generate exactly 3 insight cards from validated psychometric scores and personal context.

You will receive a JSON object with:
- scores: bigFive (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism — 0–100 percentile each), holland (Realistic, Investigative, Artistic, Social, Enterprising, Conventional — 0–100 percentile each), attachment (Avoidance, Anxiety — 0–100 percentile each), topStrengths (array of top 5 strength names), allStrengths (all 12 strengths with raw scores)
- context (optional): age range, relationship status, children, work field, hobby, clarityGoal, hardestThing, socialPerception, tooMuch, lifeStage, worstSelf

These 3 cards are the single most important conversion element in the product. A person reads them and decides whether to pay $5. They must feel shockingly personal — not general psychology that applies to anyone.

The 3 cards must cover three different domains:
Card 1: Their Internal Monologue — what is actually happening inside their head that others never see
Card 2: Their Public Face — the gap between how they appear to others and who they actually are
Card 3: Their Hidden Drive — the deeper motivation underneath their surface-level goals that even they may not have named

Each insight MUST:
- Name a specific tension between two of their actual score combinations — e.g. high Openness + high Conscientiousness, or high Agreeableness + high Avoidant attachment. Reference the actual interaction, not a single trait in isolation
- Include one concrete, non-psychological noun that grounds the insight in real daily life — something like 'the unread books on your nightstand', 'the email you drafted but never sent', 'the way you over-prepare for a simple conversation'. Make it specific enough to feel private
- Say something the person has felt their whole life but never had precise words for

Each insight MUST NOT:
- Use psychology jargon or framework names like Big Five, attachment theory, Holland Code
- Make observations that would be true for most people
- Be flattering or encouraging — surprising and precise beats comfortable

Title rules: 2-4 words, reads like a private nickname for a pattern they recognize in themselves. Examples of the right tone: 'The Diligent Architect', 'The Quiet Storm', 'Beautiful Trap', 'The Glass Wall'. Not: 'Workplace Tension', 'Analysis Paralysis', 'Creative Strength'.
Insight: 2-3 sentences. Tone is a close friend who has studied psychology and is finally saying the thing out loud. Not a therapist, not a life coach.
The three cards together should make the person feel simultaneously seen, slightly exposed, and certain the full report will change something for them.

Return ONLY a JSON object with this exact structure, no other text:
{"previewInsights": [{"title": "...", "insight": "..."}, {"title": "...", "insight": "..."}, {"title": "...", "insight": "..."}]}`;

// Max attempts before surfacing an error to the client.
// Parse failures are intermittent — a second call almost always succeeds.
const MAX_ATTEMPTS = 2;

export async function POST(request: NextRequest) {
  let body: { scores?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { scores, context } = body;
  if (!scores) {
    return Response.json({ error: "Missing scores" }, { status: 400 });
  }

  const dataPayload = context
    ? JSON.stringify({ scores, context })
    : JSON.stringify({ scores });

  const userContent = `${dataPayload}\n\nRespond with valid JSON only. Do not wrap the response in markdown code fences. Do not include any preamble, explanation, or trailing commentary. Your entire response must be a single parseable JSON object and nothing else.`;

  let lastErrorMessage = "Something went wrong. Please try again.";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // ── Claude API call ──────────────────────────────────────────────────────
    let message: Awaited<ReturnType<typeof client.messages.stream.prototype.finalMessage>>;
    try {
      const stream = client.messages.stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      });
      message = await stream.finalMessage();
    } catch (error) {
      // API-level errors (auth, rate limit, billing) are not retry-able
      console.error(`[generate-preview] API error on attempt ${attempt}:`, error);
      if (error instanceof Anthropic.APIError) {
        if (error.status === 402) {
          return Response.json(
            { error: "API credit balance is too low. Please add credits and try again." },
            { status: 402 }
          );
        }
        if (error.status === 429) {
          return Response.json(
            { error: "We are temporarily rate limited. Please wait 30 seconds and try again." },
            { status: 429 }
          );
        }
        if (error.status >= 500) {
          return Response.json(
            { error: "Our AI is briefly unavailable. Please try again in a moment." },
            { status: 503 }
          );
        }
      }
      return Response.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    // ── Truncation check ─────────────────────────────────────────────────────
    if (message.stop_reason === "max_tokens") {
      console.warn(`[generate-preview] attempt ${attempt}: response truncated (max_tokens)`);
      lastErrorMessage = "Preview was cut short — please try again";
      continue; // retry — a shorter response may fit
    }

    // ── Extract text block ───────────────────────────────────────────────────
    const textBlock = message.content.find((b: { type: string }) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.warn(`[generate-preview] attempt ${attempt}: no text block in response`);
      lastErrorMessage = "No text content in response — please try again";
      continue;
    }

    const text = textBlock.text;
    if (process.env.NODE_ENV !== "production") {
      console.log(`[generate-preview] attempt ${attempt} raw (first 500):`, text.slice(0, 500));
    }

    // ── JSON extraction ──────────────────────────────────────────────────────
    const raw = extractJSONObject(text, "previewInsights");

    if (!raw) {
      console.warn(`[generate-preview] attempt ${attempt}: no JSON found. Full response:`, text);
      lastErrorMessage = "Failed to parse preview response — please try again";
      continue;
    }

    // ── Parse + validate ─────────────────────────────────────────────────────
    try {
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed.previewInsights) || parsed.previewInsights.length !== 3) {
        console.warn(
          `[generate-preview] attempt ${attempt}: invalid structure — previewInsights:`,
          parsed.previewInsights?.length ?? "missing"
        );
        lastErrorMessage = "Preview format error — please try again";
        continue;
      }

      if (attempt > 1) {
        console.log(`[generate-preview] succeeded on attempt ${attempt}`);
      }
      return Response.json(parsed);
    } catch (parseErr) {
      console.warn(
        `[generate-preview] attempt ${attempt}: JSON.parse failed:`,
        parseErr,
        "\nRaw slice:",
        raw.slice(0, 500)
      );
      lastErrorMessage = "Failed to parse preview response — please try again";
      continue;
    }
  }

  // All attempts exhausted
  console.error(`[generate-preview] all ${MAX_ATTEMPTS} attempts failed. Last error: ${lastErrorMessage}`);
  return Response.json({ error: lastErrorMessage }, { status: 500 });
}

/**
 * Extracts the first complete JSON object containing `rootKey` from arbitrary text.
 * Three strategies in order of precision:
 *   1. Fast path — text is already clean JSON
 *   2. Key-based — find rootKey, walk back to opening {, count brace depth to closing }
 *   3. Fence strip — strip markdown fences, return remainder if it starts with {
 *   4. Brute-force — slice from first { to last }, attempt parse
 */
function extractJSONObject(text: string, rootKey: string): string | null {
  // Strategy 1: text is already clean JSON
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;

  // Strategy 2: find root key, walk back to opening {, brace-count forward
  const keyIdx = text.indexOf(`"${rootKey}"`);
  if (keyIdx !== -1) {
    for (let i = keyIdx - 1; i >= 0; i--) {
      if (text[i] === "{") {
        let depth = 0;
        for (let j = i; j < text.length; j++) {
          if (text[j] === "{") depth++;
          else if (text[j] === "}") {
            depth--;
            if (depth === 0) return text.slice(i, j + 1);
          }
        }
        break; // unbalanced — fall through
      }
    }
  }

  // Strategy 3: strip markdown fences
  const stripped = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  if (stripped.startsWith("{")) return stripped;

  // Strategy 4: brute-force — first { to last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return null;
}
