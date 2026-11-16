// Writes one person's 90-day journal. The plan (which kind of day falls where)
// comes from code; Ember writes every word in four calls side by side: the
// letters, and one call per 30-day stretch. Each result is checked against the
// plan and retried until it's complete.

import Anthropic from "@anthropic-ai/sdk";
import { JOURNAL_LETTERS_PROMPT, JOURNAL_PHASE_PROMPT } from "@/lib/prompts";
import { AI_MODEL, MOCK_MODE } from "@/lib/server/config";
import { extractStructured } from "@/lib/server/extract";
import { contextNeedsCare } from "@/lib/safety";
import { NOTE_SLOTS, pickRetake, planDays } from "@/lib/journal/plan";
import { PHASES, WEEKS, weekOf, type DayKind, type JournalContent, type JournalDay } from "@/lib/journal/types";
import { mockJournal } from "./mock";

export type JournalInputs = {
  scores: Record<string, unknown>;
  context: Record<string, string> | null;
  answers: Record<number, number> | null;
  report: { title: string; content: string }[];
  firstName: string;
  words: string[];
};

const MAX_ATTEMPTS = 3;
const KINDS: DayKind[] = ["practice", "question", "mirror", "dream", "honest", "letter", "wild", "strength", "savor", "bestself", "retake", "rest"];
const OPEN_WHEN = [
  "When you want to quit",
  "When someone hurts you",
  "When you're proud of yourself",
  "When you can't sleep",
  "When you slip back into the old pattern",
  "When you feel lost",
];

const text = { type: "string" } as const;

const STRETCH_TOOL: Anthropic.Tool = {
  name: "write_journal_stretch",
  description: "Return one 30-day stretch of the journal.",
  input_schema: {
    type: "object",
    properties: {
      letter: text,
      days: {
        type: "array",
        items: {
          type: "object",
          properties: {
            day: { type: "integer" },
            kind: { type: "string", enum: KINDS },
            lesson: text,
            when: text,
            then: text,
            prompt: text,
            title: text,
            steps: { type: "array", items: text },
          },
          required: ["day", "kind", "lesson", "when", "then", "prompt", "title", "steps"],
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
  description: "Return the letters and notes that surround the ninety days.",
  input_schema: {
    type: "object",
    properties: {
      opening: text,
      closing: text,
      dedication: text,
      pattern: text,
      notes: { type: "array", items: text },
      openWhen: { type: "array", items: text },
    },
    required: ["opening", "closing", "dedication", "pattern", "notes", "openWhen"],
    additionalProperties: false,
  },
  strict: true,
};

const clean = (s: unknown) => (typeof s === "string" ? s.replace(/[ \t]+/g, " ").trim() : "");

async function ask<T>(
  client: Anthropic,
  system: string,
  tool: Anthropic.Tool,
  payload: object,
  valid: (d: T | null) => d is T,
  deadline: number,
  /** Turns a nearly complete answer into a usable one, used only if no attempt is fully valid. */
  repair: (d: T | null) => T | null = () => null
): Promise<T> {
  let lastProblem = "no response";
  let fallback: T | null = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const left = deadline - Date.now();
    // A stretch takes a minute or two to write; don't start one that can't finish.
    if (attempt > 1 && left < 90_000) break;
    try {
      const stream = client.messages.stream(
        {
        model: AI_MODEL,
        max_tokens: 24000,
        system,
        tools: [tool],
        tool_choice: { type: "auto" },
        thinking: { type: "between_tools" },
        messages: [{ role: "user", content: `${JSON.stringify(payload)}\n\nWrite it now using the ${tool.name} tool.` }],
        },
        { timeout: Math.max(30_000, left) }
      );
      const message = await stream.finalMessage();
      if (message.stop_reason === "max_tokens") {
        lastProblem = "cut short";
      } else {
        const data = extractStructured<T>(message, tool.name);
        if (valid(data)) return data;
        fallback = fallback ?? repair(data);
        lastProblem = "incomplete or off-plan";
      }
    } catch (error) {
      lastProblem = error instanceof Error ? error.message : String(error);
      // Billing, auth, and bad requests won't fix themselves on retry.
      if (error instanceof Anthropic.APIError && [400, 401, 403].includes(error.status ?? 0)) break;
    }
    console.warn(`[journal] ${tool.name} attempt ${attempt}: ${lastProblem}`);
  }
  if (fallback) {
    console.warn(`[journal] ${tool.name}: using a repaired answer`);
    return fallback;
  }
  throw new Error(`Journal ${tool.name} failed: ${lastProblem}`);
}

type RawDay = JournalDay;
type RawStretch = { letter: string; days: RawDay[]; checkins: string[] };
type RawLetters = { opening: string; closing: string; dedication: string; pattern: string; notes: string[]; openWhen: string[] };

/** The fields each kind of day must have. */
const NEEDS: Record<DayKind, (keyof JournalDay)[]> = {
  practice: ["lesson", "when", "then", "prompt"],
  question: ["prompt"],
  mirror: ["lesson", "prompt"],
  dream: ["lesson", "prompt"],
  honest: ["title", "lesson", "prompt"],
  letter: ["title", "lesson"],
  wild: ["lesson", "prompt"],
  strength: ["lesson", "then", "prompt"],
  savor: ["lesson", "prompt"],
  bestself: ["lesson", "prompt"],
  retake: ["lesson", "prompt"],
  rest: ["lesson"],
};

/** Day numbers and kinds come from the plan; only the writing has to be there. */
function dayFits(d: RawDay, plannedKind: DayKind): boolean {
  if (!d) return false;
  if (!NEEDS[plannedKind].every((f) => clean(d[f]))) return false;
  if ((plannedKind === "mirror" || plannedKind === "dream") && (!Array.isArray(d.steps) || d.steps.filter((s) => clean(s)).length < 3)) return false;
  return true;
}

const tidyDay = (d: RawDay, day: number, kind: DayKind): JournalDay => ({
  day,
  kind,
  lesson: clean(d.lesson),
  // "When …," always leads into "I will …".
  when: clean(d.when).replace(/[.;:!]+$/, "").replace(/([^,])$/, "$1,"),
  then: clean(d.then),
  prompt: clean(d.prompt),
  title: clean(d.title),
  steps: (d.steps ?? []).map(clean).filter(Boolean).slice(0, 3),
});

/** The bold line that ends each of report parts 1–8. */
export function linesWorthCarrying(report: { title: string; content: string }[]) {
  return report.slice(0, 8).flatMap((s) => {
    const bold = [...s.content.matchAll(/\*\*([^*]{8,220})\*\*/g)].map((m) => m[1].trim());
    const line = bold[bold.length - 1];
    return line ? [{ title: s.title, line }] : [];
  });
}

/** "**Title** — Author. Why…" lines under the Books heading of report part 9. */
export function booksFrom(report: { title: string; content: string }[]) {
  const plan = report[8]?.content ?? "";
  const after = plan.split(/\*\*Books\*\*/)[1]?.split(/\*\*(?:Journal Prompts|Daily Practices|Start tomorrow|A question for this week)\*\*/)[0] ?? "";
  return [...after.matchAll(/\*\*([^*]+)\*\*\s*[—–-]\s*([^.\n]+)/g)].slice(0, 3).map((m) => ({ title: m[1].trim(), author: m[2].trim() }));
}

export async function generateJournal(inputs: JournalInputs): Promise<JournalContent> {
  const care = contextNeedsCare(inputs.context ?? undefined);
  const kinds = planDays({ scores: inputs.scores, context: inputs.context, answers: inputs.answers, care });
  const shared = {
    firstName: inputs.firstName,
    hope: care ? "" : clean(inputs.context?.ninetyDayHope).slice(0, 320),
    retake: pickRetake(inputs.answers),
    carry: linesWorthCarrying(inputs.report),
    words: inputs.words,
    books: booksFrom(inputs.report),
    care,
  };

  if (MOCK_MODE) return mockJournal(kinds, shared);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 3 });
  // The whole journal must finish inside the server's five-minute limit.
  const deadline = Date.now() + 265_000;
  const base = {
    scores: inputs.scores,
    ...(inputs.context ? { context: inputs.context } : {}),
    ...(care ? { care: true } : {}),
    report: inputs.report,
    firstName: inputs.firstName,
  };

  const stretchPayload = (i: number) => {
    const first = PHASES[i].first;
    return {
      ...base,
      stretch: {
        name: PHASES[i].name,
        days: `${first}–${first + 29}`,
        plan: Array.from({ length: 30 }, (_, k) => {
          const day = first + k;
          return { day, kind: kinds[day - 1], week: weekOf(day).theme };
        }),
        checkinWeeks: WEEKS.slice(i * 4, i * 4 + 4).map((w) => ({ week: w.n, theme: w.theme })),
      },
    };
  };

  const stretchValid = (i: number) => (d: RawStretch | null): d is RawStretch => {
    if (!d || clean(d.letter).length < 40 || !Array.isArray(d.days) || d.days.length !== 30) return false;
    if (!Array.isArray(d.checkins) || d.checkins.filter((c) => clean(c)).length < 4) return false;
    const first = PHASES[i].first;
    return d.days.every((day, k) => dayFits(day, kinds[first + k - 1]));
  };

  // A stretch with a few malformed days still makes a good book: those days become rest days.
  const stretchRepair = (i: number) => (d: RawStretch | null): RawStretch | null => {
    if (!d || clean(d.letter).length < 40 || !Array.isArray(d.days) || d.days.length !== 30) return null;
    const first = PHASES[i].first;
    const misfits = d.days.filter((day, k) => !dayFits(day, kinds[first + k - 1])).length;
    if (misfits > 4) return null;
    const days = d.days.map((day, k) => {
      if (dayFits(day, kinds[first + k - 1])) return day;
      kinds[first + k - 1] = "rest";
      return { ...day, lesson: "Rest is part of the climb. Nothing to do today.", steps: [] };
    });
    const checkins = WEEKS.slice(i * 4, i * 4 + 4).map((w, k) => clean(d.checkins?.[k]) || `Looking back on ${w.theme.toLowerCase()}: ${w.question}`);
    return { letter: d.letter, days, checkins };
  };

  const lettersRepair = (d: RawLetters | null): RawLetters | null =>
    d && clean(d.opening).length > 300 && clean(d.closing).length > 200
      ? {
          ...d,
          dedication: clean(d.dedication) || `For ${inputs.firstName}, one page at a time.`,
          pattern: clean(d.pattern),
          notes: Array.isArray(d.notes) ? d.notes : [],
          openWhen: Array.isArray(d.openWhen) ? d.openWhen : [],
        }
      : null;

  const lettersValid = (d: RawLetters | null): d is RawLetters =>
    !!d &&
    clean(d.opening).length > 300 &&
    clean(d.closing).length > 200 &&
    !!clean(d.dedication) &&
    !!clean(d.pattern) &&
    Array.isArray(d.notes) &&
    d.notes.filter((n) => clean(n)).length >= 3 &&
    Array.isArray(d.openWhen) &&
    d.openWhen.filter((n) => clean(n)).length >= 6;

  const [letters, ...stretches] = await Promise.all([
    ask<RawLetters>(client, JOURNAL_LETTERS_PROMPT, LETTERS_TOOL, base, lettersValid, deadline, lettersRepair),
    ...PHASES.map((_, i) => ask<RawStretch>(client, JOURNAL_PHASE_PROMPT, STRETCH_TOOL, stretchPayload(i), stretchValid(i), deadline, stretchRepair(i))),
  ]);

  return {
    ...shared,
    dedication: clean(letters.dedication),
    opening: clean(letters.opening),
    closing: clean(letters.closing),
    pattern: clean(letters.pattern),
    phases: stretches.map((s, i) => ({ name: PHASES[i].name, letter: clean(s.letter) })),
    days: stretches.flatMap((s, i) => s.days.map((d, k) => tidyDay(d, PHASES[i].first + k, kinds[PHASES[i].first + k - 1]))),
    weeks: WEEKS.map((w, k) => ({ n: w.n, theme: w.theme, checkin: clean(stretches[Math.floor(k / 4)].checkins[k % 4]) })),
    notes: NOTE_SLOTS.map((slot, k) => ({ ...slot, text: clean(letters.notes?.[k]) })),
    openWhen: OPEN_WHEN.map((when, k) => ({ when, letter: clean(letters.openWhen?.[k]) })),
  };
}

