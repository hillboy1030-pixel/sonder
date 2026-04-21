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

// Tool schema — forces the API to serialize the output itself, eliminating JSON parse failures.
const PREVIEW_TOOL: Anthropic.Tool = {
  name: "return_preview_insights",
  description: "Return exactly three preview insight cards.",
  input_schema: {
    type: "object",
    properties: {
      previewInsights: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title:   { type: "string" },
            insight: { type: "string" },
          },
          required: ["title", "insight"],
        },
        minItems: 3,
        maxItems: 3,
      },
    },
    required: ["previewInsights"],
  },
};

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

  const userContent = `${dataPayload}\n\nGenerate the three preview insight cards using the return_preview_insights tool.`;

  let lastErrorMessage = "Something went wrong. Please try again.";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // ── Claude API call (tool_use guarantees valid structured output) ─────────
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        stream: false,
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [PREVIEW_TOOL],
        tool_choice: { type: "tool", name: "return_preview_insights" },
        messages: [{ role: "user", content: userContent }],
      });
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

    // ── Extract tool_use result ───────────────────────────────────────────────
    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      console.warn(`[generate-preview] attempt ${attempt}: no tool_use block in response`);
      lastErrorMessage = "Preview generation failed — please try again";
      continue;
    }

    // ── Validate structure ────────────────────────────────────────────────────
    const data = toolUse.input as { previewInsights?: { title: string; insight: string }[] };
    if (!Array.isArray(data.previewInsights) || data.previewInsights.length !== 3) {
      console.warn(
        `[generate-preview] attempt ${attempt}: invalid structure — previewInsights:`,
        data.previewInsights?.length ?? "missing"
      );
      lastErrorMessage = "Preview format error — please try again";
      continue;
    }

    if (attempt > 1) {
      console.log(`[generate-preview] succeeded on attempt ${attempt}`);
    }
    return Response.json(data);
  }

  // All attempts exhausted
  console.error(`[generate-preview] all ${MAX_ATTEMPTS} attempts failed. Last error: ${lastErrorMessage}`);
  return Response.json({ error: lastErrorMessage }, { status: 500 });
}

