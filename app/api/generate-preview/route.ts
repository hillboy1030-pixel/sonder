import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { PREVIEW_SYSTEM_PROMPT } from "@/lib/prompts";
import { AI_MODEL, MOCK_MODE } from "@/lib/server/config";
import { cleanContext, cleanScores } from "@/lib/server/validate";
import { contextNeedsCare } from "@/lib/safety";
import { MOCK_PREVIEW, mockDelay } from "@/lib/server/mockData";
import { aiErrorResponse } from "@/lib/server/aiErrors";
import { extractStructured } from "@/lib/server/extract";

// Fast call: only the 3 free preview cards (~15–25s)
export const maxDuration = 60;

const MAX_ATTEMPTS = 2;

// A strict tool gives structured JSON. (Sonnet 5.5 doesn't allow forcing the tool, so the
// instructions ask for it and the code retries if the model answers in plain text.)
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
            title: { type: "string" },
            insight: { type: "string" },
          },
          required: ["title", "insight"],
          additionalProperties: false,
        },
      },
    },
    required: ["previewInsights"],
    additionalProperties: false,
  },
  strict: true,
};

export async function POST(request: NextRequest) {
  let body: { scores?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const scores = cleanScores(body.scores);
  if (!scores) {
    return Response.json({ error: "Your answers look incomplete. Please retake the assessment." }, { status: 400 });
  }
  const context = cleanContext(body.context);

  if (MOCK_MODE) {
    await mockDelay(2500);
    return Response.json(MOCK_PREVIEW);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const userContent = `${JSON.stringify({ scores, ...(context ? { context } : {}), ...(contextNeedsCare(context) ? { care: true } : {}) })}\n\nGenerate the three preview insight cards using the return_preview_insights tool.`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: AI_MODEL,
        max_tokens: 4000,
        system: PREVIEW_SYSTEM_PROMPT,
        tools: [PREVIEW_TOOL],
        tool_choice: { type: "auto" },
        thinking: { type: "between_tools" },
        messages: [{ role: "user", content: userContent }],
      });
    } catch (error) {
      console.error(`[generate-preview] API error on attempt ${attempt}:`, error);
      return aiErrorResponse(error);
    }

    const data = extractStructured<{ previewInsights?: { title: string; insight: string }[] }>(response, PREVIEW_TOOL.name);

    if (data && Array.isArray(data.previewInsights) && data.previewInsights.length === 3) {
      return Response.json(data);
    }
    console.warn(`[generate-preview] attempt ${attempt}: unexpected response shape`);
  }

  return Response.json({ error: "Your preview didn't come through. Please try again." }, { status: 500 });
}
