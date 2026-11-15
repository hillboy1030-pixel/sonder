import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { REPORT_SYSTEM_PROMPT } from "@/lib/prompts";
import { AI_MODEL, MOCK_MODE } from "@/lib/server/config";
import { cleanContext, cleanScores } from "@/lib/server/validate";
import { contextNeedsCare } from "@/lib/safety";
import { checkPurchase } from "@/lib/server/payment";
import { MOCK_REPORT, mockDelay } from "@/lib/server/mockData";
import { aiErrorResponse } from "@/lib/server/aiErrors";
import { extractStructured } from "@/lib/server/extract";

// The full report takes 2–3 minutes to write.
export const maxDuration = 300;

const MAX_ATTEMPTS = 2;

const REPORT_TOOL: Anthropic.Tool = {
  name: "return_report",
  description: "Return the complete Sonder report with exactly 9 sections.",
  input_schema: {
    type: "object",
    properties: {
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            content: { type: "string" },
          },
          required: ["title", "content"],
          additionalProperties: false,
        },
      },
    },
    required: ["sections"],
    additionalProperties: false,
  },
  strict: true,
};

export async function POST(request: NextRequest) {
  let body: { scores?: unknown; context?: unknown; session_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // ── Payment is verified on the server, every time ──────────────────────────
  const purchase = await checkPurchase(body.session_id);
  if (!purchase.ok) {
    return Response.json({ error: purchase.error, code: "payment" }, { status: purchase.status });
  }

  const scores = cleanScores(body.scores);
  if (!scores) {
    return Response.json({ error: "Your answers look incomplete. Please retake the assessment." }, { status: 400 });
  }
  const context = cleanContext(body.context);

  if (MOCK_MODE) {
    await mockDelay(4000);
    return Response.json(MOCK_REPORT);
  }

  try {
    await purchase.consume();
  } catch (error) {
    console.error("[generate-report] could not record usage:", error);
    return Response.json({ error: "We couldn't confirm your purchase just now. Please try again." }, { status: 503 });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const userContent = `${JSON.stringify({ scores, ...(context ? { context } : {}), ...(contextNeedsCare(context) ? { care: true } : {}) })}\n\nGenerate the complete Sonder report using the return_report tool.`;

  let lastError = "Your report didn't come through. Please try again.";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let message: Anthropic.Message;
    try {
      // Streaming keeps the connection alive during the long write.
      const stream = client.messages.stream({
        model: AI_MODEL,
        max_tokens: 16000,
        system: REPORT_SYSTEM_PROMPT,
        tools: [REPORT_TOOL],
        tool_choice: { type: "auto" },
        thinking: { type: "between_tools" },
        messages: [{ role: "user", content: userContent }],
      });
      message = await stream.finalMessage();
    } catch (error) {
      console.error(`[generate-report] API error on attempt ${attempt}:`, error);
      return aiErrorResponse(error);
    }

    if (message.stop_reason === "max_tokens") {
      console.warn(`[generate-report] attempt ${attempt}: truncated`);
      lastError = "Your report was cut short. Please try again.";
      continue;
    }

    const data = extractStructured<{ sections?: { title: string; content: string }[] }>(message, REPORT_TOOL.name);

    if (data && Array.isArray(data.sections) && data.sections.length === 9) {
      return Response.json(data);
    }
    console.warn(`[generate-report] attempt ${attempt}: unexpected response shape`);
  }

  return Response.json({ error: lastError }, { status: 500 });
}
