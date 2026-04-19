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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scores, context } = body;

    if (!scores) {
      return Response.json({ error: "Missing scores" }, { status: 400 });
    }

    const userContent = context
      ? JSON.stringify({ scores, context })
      : JSON.stringify({ scores });

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "max_tokens") {
      console.error("Preview generation hit max_tokens limit — response was truncated");
      return Response.json(
        { error: "Preview was cut short — please try again" },
        { status: 500 }
      );
    }

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json(
        { error: "No text content in response" },
        { status: 500 }
      );
    }

    // Always log the raw response in dev so failures are immediately diagnosable
    const text = textBlock.text;
    if (process.env.NODE_ENV !== "production") {
      console.log("[generate-preview] raw response:", text.slice(0, 500));
    }

    // Extract the JSON object by finding our expected root key, walking back to the
    // opening { and forward counting brace depth to the matching }.
    // This is immune to preamble text (with or without {}), trailing notes, and fences.
    const raw = extractJSONObject(text, "previewInsights");

    if (!raw) {
      console.error("[generate-preview] No JSON object found. Full response:", text);
      return Response.json(
        { error: "Failed to parse preview response — please try again" },
        { status: 500 }
      );
    }

    try {
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed.previewInsights) || parsed.previewInsights.length !== 3) {
        console.error(
          "Preview structure invalid — previewInsights:",
          parsed.previewInsights?.length ?? "missing",
          "Raw:",
          raw.slice(0, 300)
        );
        return Response.json(
          { error: "Preview format error — please try again" },
          { status: 500 }
        );
      }

      return Response.json(parsed);
    } catch (parseErr) {
      console.error("[generate-preview] JSON parse failed. Error:", parseErr, "\nRaw:", raw.slice(0, 1000));
      return Response.json(
        { error: "Failed to parse preview response — please try again" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[generate-preview] error:", error);

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
}

/**
 * Extracts the first complete JSON object containing `rootKey` from arbitrary text.
 * Handles preamble text, markdown fences, and trailing notes robustly.
 * Uses key-based search + brace depth counting — immune to { } in surrounding text.
 */
function extractJSONObject(text: string, rootKey: string): string | null {
  // Fast path: text is already clean JSON
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return trimmed;

  // Find the root key, walk backward to the opening {, then count brace depth forward
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
        break; // unbalanced braces — fall through to next strategy
      }
    }
  }

  // Fallback: strip markdown fences and return the remainder
  const stripped = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  if (stripped.startsWith("{")) return stripped;

  return null;
}
