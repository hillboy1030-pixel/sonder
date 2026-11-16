// The shape of each person's ninety days: which kind of day falls where.
// Code, not AI, decides the shape, so every book is well-formed; Ember then
// writes every word of it for the person. Counts follow the journal blueprint.

import { SECTIONS } from "@/lib/questions";
import type { DayKind, RetakeItem } from "./types";

// prettier-ignore
const BASE: DayKind[] = [
  // Ground, days 1–30: noticing
  "practice", "practice", "bestself", "practice", "practice", "question", "practice", // wk 1
  "practice", "practice", "wild", "practice", "strength", "practice", "rest", // wk 2
  "practice", "question", "practice", "practice", "dream", "practice", "wild", // wk 3
  "practice", "strength", "practice", "letter", "practice", "question", "practice", // wk 4
  "wild", "practice", // threshold
  // Climb, days 31–60: meeting what you hide
  "practice", "mirror", "practice", "question", "mirror", "practice", "dream", // wk 5
  "honest", "honest", "honest", "honest", "savor", "rest", "letter", // wk 6
  "retake", "mirror", "practice", "mirror", "wild", "question", "mirror", // wk 7
  "practice", "letter", "practice", "mirror", "dream", "practice", "wild", // wk 8
  "question", "practice", // the turn
  // Return, days 61–90: coming home whole
  "practice", "practice", "letter", "practice", "wild", "practice", "savor", // wk 9
  "practice", "strength", "practice", "question", "practice", "wild", "rest", // wk 10
  "practice", "mirror", "practice", "dream", "savor", "practice", "rest", // wk 11
  "practice", "strength", "letter", "bestself", "mirror", "wild", "practice", // wk 12
  "question", "retake", // the summit
];

/** Upside-down notes: printed on one day, to be read on another. */
export const NOTE_SLOTS = [
  { onDay: 1, readOn: 90 },
  { onDay: 9, readOn: 42 },
  { onDay: 36, readOn: 66 },
];

export type PlanInputs = {
  scores: Record<string, unknown>;
  context: Record<string, string> | null;
  answers: Record<number, number> | null;
  care: boolean;
};

const num = (v: unknown) => (typeof v === "number" ? v : 50);

/** The kind of each of the ninety days for this person. */
export function planDays({ scores, context, care }: PlanInputs): DayKind[] {
  const days = [...BASE];
  const big5 = (scores.bigFive ?? {}) as Record<string, unknown>;
  const set = (day: number, kind: DayKind) => (days[day - 1] = kind);

  if (care) {
    // A gentler book: no shadow work, no expressive writing about pain.
    days.forEach((k, i) => {
      if (k === "mirror") days[i] = i % 2 ? "savor" : "practice";
    });
    // The four honest days stay, but Ember writes them as self-compassion (see prompts).
    set(50, "rest");
  }

  // Imagination: more dream pages for the vivid, fewer for the very concrete.
  const openness = num(big5.Openness);
  if (openness >= 70) set(54, "dream");
  if (openness <= 35) set(78, "practice");

  // "Steady me": an extra rest day in the climb.
  if ((context?.guideStyle ?? "").toLowerCase().startsWith("steady")) set(57, "rest");

  return days;
}

/**
 * Ten statements to answer again on days 45 and 90: the ones they answered
 * most strongly, spread across the four parts of the climb.
 */
export function pickRetake(answers: Record<number, number> | null): RetakeItem[] {
  // Career interests ask how much you'd enjoy an activity; they don't make sense to retake.
  const all = SECTIONS.flatMap((s, si) => (si === 1 ? [] : s.questions.map((q) => ({ ...q, si }))));
  const answered = all.filter((q) => answers?.[q.id]);
  const pool = answered.length >= 10 ? answered : all;
  const strength = (q: { id: number }) => Math.abs((answers?.[q.id] ?? 3) - 3);
  const sorted = [...pool].sort((a, b) => strength(b) - strength(a) || a.id - b.id);
  const picked: typeof sorted = [];
  // Round-robin across sections so it isn't all one part of the climb.
  for (let round = 0; picked.length < 10 && round < 20; round++) {
    for (let si = 0; si < SECTIONS.length && picked.length < 10; si++) {
      const next = sorted.find((q) => q.si === si && !picked.includes(q));
      if (next) picked.push(next);
    }
  }
  return picked
    .sort((a, b) => a.id - b.id)
    .map((q) => ({ id: q.id, statement: q.text, original: answers?.[q.id] ?? 3 }));
}
