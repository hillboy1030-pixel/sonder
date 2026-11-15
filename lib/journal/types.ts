// The content of one person's printed 90-day journal.

export type JournalDay = { lesson: string; challenge: string; prompt: string };

export type JournalPhase = {
  name: "Ground" | "Climb" | "Return";
  letter: string;
  days: JournalDay[]; // 30
  checkins: string[]; // 4
};

export type JournalContent = {
  firstName: string;
  dedication: string;
  opening: string;
  closing: string;
  phases: JournalPhase[]; // 3
  /** The lines worth carrying, taken from the report (bold lines from parts 1–8). */
  carry: { title: string; line: string }[];
  /** The four stone words from the climb, if they finished it. */
  words: string[];
};

export const PHASES = [
  { name: "Ground", first: 1, focus: "Noticing" },
  { name: "Climb", first: 31, focus: "Practicing" },
  { name: "Return", first: 61, focus: "Living it" },
] as const;
