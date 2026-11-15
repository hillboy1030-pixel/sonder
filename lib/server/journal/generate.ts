// Writes one person's 90-day journal. Four calls run side by side (the letters
// and the three 30-day phases), each checked and retried until it's complete.

import Anthropic from "@anthropic-ai/sdk";
import { JOURNAL_LETTERS_PROMPT, JOURNAL_PHASE_PROMPT } from "@/lib/prompts";
import { AI_MODEL, MOCK_MODE } from "@/lib/server/config";
import { extractStructured } from "@/lib/server/extract";
import { contextNeedsCare } from "@/lib/safety";
import { PHASES, type JournalContent, type JournalPhase } from "@/lib/journal/types";
import { mockJournal } from "./mock";

export type JournalInputs = {
  scores: Record<string, unknown>;
  context: Record<string, string> | null;
  report: { title: string; content: string }[];
  firstName: string;
  words: string[];
};

const MAX_ATTEMPTS = 3;

const text = { type: "string" } as const;

const PHASE_TOOL: Anthropic.Tool = {
  name: "write_journal_phase",
  description: "Return one 30-day phase of the journal.",
  input_schema: {
    type: "object",
    properties: {
      letter: text,
      days: {
        type: "array",
        items: {
          type: "object",
          properties: { lesson: text, challenge: text, prompt: text },
          required: ["lesson", "challenge", "prompt"],
          additionalProperties: false,
        },
      },
      checkins: { type: "array", items: text },
    },
    required: ["letter", "days", "checkins"],
    additionalProperties: false,
  },
  strict: true,
};

const LETTERS_TOOL: Anthropic.Tool = {
  name: "write_journal_letters",
  description: "Return the opening letter, closing letter, and dedication.",
  input_schema: {
    type: "object",
    properties: { opening: text, closing: text, dedication: text },
    required: ["opening", "closing", "dedication"],
    additionalProperties: false,
  },
  strict: true,
};

const clean = (s: unknown) => (typeof s === "string" ? s.replace(/[ \t]+/g, " ").trim() : "");

async function ask<T>(client: Anthropic, system: string, tool: Anthropic.Tool, payload: object, valid: (d: T | null) => d is T): Promise<T> {
  let lastProblem = "no response";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const stream = client.messages.stream({
        model: AI_MODEL,
        max_tokens: 16000,
        system,
        tools: [tool],
        tool_choice: { type: "auto" },
        thinking: { type: "between_tools" },
        messages: [{ role: "user", content: `${JSON.stringify(payload)}\n\nWrite it now using the ${tool.name} tool.` }],
      });
      const message = await stream.finalMessage();
      if (message.stop_reason === "max_tokens") {
        lastProblem = "cut short";
        continue;
      }
      const data = extractStructured<T>(message, tool.name);
      if (valid(data)) return data;
      lastProblem = "incomplete";
    } catch (error) {
      lastProblem = error instanceof Error ? error.message : String(error);
      // Billing/auth problems won't fix themselves on retry.
      if (error instanceof Anthropic.APIError && [400, 401, 403].includes(error.status ?? 0)) break;
    }
    console.warn(`[journal] ${tool.name} attempt ${attempt}: ${lastProblem}`);
  }
  throw new Error(`Journal ${tool.name} failed: ${lastProblem}`);
}

type RawPhase = { letter: string; days: { lesson: string; challenge: string; prompt: string }[]; checkins: string[] };
type RawLetters = { opening: string; closing: string; dedication: string };

const isPhase = (d: RawPhase | null): d is RawPhase =>
  !!d &&
  clean(d.letter).length > 40 &&
  Array.isArray(d.days) &&
  d.days.length === 30 &&
  d.days.every((x) => clean(x.lesson) && clean(x.challenge) && clean(x.prompt)) &&
  Array.isArray(d.checkins) &&
  d.checkins.length >= 4 &&
  d.checkins.slice(0, 4).every((c) => clean(c));

const isLetters = (d: RawLetters | null): d is RawLetters =>
  !!d && clean(d.opening).length > 300 && clean(d.closing).length > 200 && !!clean(d.dedication);

/** The bold line that ends each of report parts 1–8. */
export function linesWorthCarrying(report: { title: string; content: string }[]) {
  return report.slice(0, 8).flatMap((s) => {
    const bold = [...s.content.matchAll(/\*\*([^*]{8,220})\*\*/g)].map((m) => m[1].trim());
    const line = bold[bold.length - 1];
    return line ? [{ title: s.title, line }] : [];
  });
}

export async function generateJournal(inputs: JournalInputs): Promise<JournalContent> {
  const carry = linesWorthCarrying(inputs.report);
  if (MOCK_MODE) return { ...mockJournal(inputs.firstName, inputs.words), carry: carry.length ? carry : mockJournal("", []).carry };

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const base = {
    scores: inputs.scores,
    ...(inputs.context ? { context: inputs.context } : {}),
    ...(contextNeedsCare(inputs.context ?? undefined) ? { care: true } : {}),
    report: inputs.report,
    firstName: inputs.firstName,
  };

  const [letters, ...phases] = await Promise.all([
    ask<RawLetters>(client, JOURNAL_LETTERS_PROMPT, LETTERS_TOOL, base, isLetters),
    ...PHASES.map((p) =>
      ask<RawPhase>(client, JOURNAL_PHASE_PROMPT, PHASE_TOOL, { ...base, phase: { name: p.name, days: `${p.first}–${p.first + 29}` } }, isPhase)
    ),
  ]);

  return {
    firstName: inputs.firstName,
    dedication: clean(letters.dedication),
    opening: clean(letters.opening),
    closing: clean(letters.closing),
    phases: phases.map(
      (p, i): JournalPhase => ({
        name: PHASES[i].name,
        letter: clean(p.letter),
        days: p.days.map((d) => ({ lesson: clean(d.lesson), challenge: clean(d.challenge), prompt: clean(d.prompt) })),
        checkins: p.checkins.slice(0, 4).map(clean),
      })
    ),
    carry,
    words: inputs.words,
  };
}
