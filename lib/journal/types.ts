// The content of one person's printed 90-day journal (see the journal
// blueprint in the Sonder project for why each piece exists).

/** The twelve kinds of day. Every day is one two-page spread. */
export type DayKind =
  | "practice" // a lesson, a when–then plan, an evening question
  | "question" // one unanswerable question on an empty spread
  | "mirror" // projection: what bothers you in others
  | "dream" // dreams, daydreams, active imagination
  | "honest" // four honest days (expressive writing)
  | "letter" // an unsent letter
  | "wild" // a wild card, printed white on black
  | "strength" // a top strength used in a new way
  | "savor" // three good things / savoring
  | "bestself" // the best possible self
  | "retake" // ten original statements, answered again
  | "rest"; // nothing to do

export type PhaseName = "Ground" | "Climb" | "Return";

/** One day as Ember wrote it. Fields a kind doesn't use are empty. */
export type JournalDay = {
  day: number;
  kind: DayKind;
  /** Ember's few lines (or the wild card's instruction, or the rest-day line). */
  lesson: string;
  /** Practice and strength days: the trigger, "When …". */
  when: string;
  /** Practice and strength days: the plan, "I will …". */
  then: string;
  /** The evening question, or the one question on a question day. */
  prompt: string;
  /** Letter days: who it's to. Honest days: that day's heading. */
  title: string;
  /** Mirror and dream days: the guided steps. */
  steps: string[];
};

export type JournalWeek = {
  n: number; // 1–12
  theme: string;
  /** Ember's check-in question for the end of this week. */
  checkin: string;
};

export type RetakeItem = { id: number; statement: string; original: number };

export type JournalContent = {
  firstName: string;
  dedication: string;
  opening: string;
  closing: string;
  /** Their own 90-day hope, quoted. Empty for anyone who needs extra care. */
  hope: string;
  /** The one pattern they count through the first thirty days. */
  pattern: string;
  phases: { name: PhaseName; letter: string }[];
  days: JournalDay[]; // 90
  weeks: JournalWeek[]; // 12
  /** Upside-down notes from Ember, printed on one day to be read on another. */
  notes: { onDay: number; readOn: number; text: string }[];
  openWhen: { when: string; letter: string }[];
  retake: RetakeItem[];
  carry: { title: string; line: string }[];
  words: string[];
  books: { title: string; author: string }[];
  care: boolean;
};

export const PHASES = [
  { name: "Ground", first: 1, focus: "Noticing", idea: "The mask you wear" },
  { name: "Climb", first: 31, focus: "Meeting what you hide", idea: "The parts you push away" },
  { name: "Return", first: 61, focus: "Coming home whole", idea: "The gift you carry back" },
] as const;

export const phaseOf = (day: number) => (day <= 30 ? 0 : day <= 60 ? 1 : 2);

/** The thirteen weeks (the last days of each stretch are thresholds, not weeks). */
export const WEEKS = [
  { n: 1, first: 1, theme: "Arrival", question: "Where am I standing, honestly?" },
  { n: 2, first: 8, theme: "The mask", question: "Who do I become around other people?" },
  { n: 3, first: 15, theme: "Where the energy goes", question: "What fills me, and what drains me?" },
  { n: 4, first: 22, theme: "The stories I tell", question: "What does the voice in my head keep saying?" },
  { n: 5, first: 31, theme: "What I push away", question: "What do I avoid feeling, saying, or wanting?" },
  { n: 6, first: 38, theme: "Four honest days", question: "What have I never fully written down?" },
  { n: 7, first: 45, theme: "The other in the mirror", question: "What irritates me in others that lives in me?" },
  { n: 8, first: 52, theme: "The harder choice", question: "What would I do if I acted from what I value?" },
  { n: 9, first: 61, theme: "Bringing it home", question: "How do I let the people I love see this?" },
  { n: 10, first: 68, theme: "Work that fits", question: "Where does my work give something back?" },
  { n: 11, first: 75, theme: "Kindness inward", question: "Can I treat myself the way I treat others?" },
  { n: 12, first: 82, theme: "The gift", question: "What do I carry back for other people?" },
] as const;

export const THRESHOLDS = [
  { first: 29, theme: "The threshold", question: "What am I ready to stop pretending?" },
  { first: 59, theme: "The turn", question: "What did the climb show me?" },
  { first: 89, theme: "The summit", question: "Who am I now, and who am I becoming?" },
] as const;

/** Which week (or threshold) a day belongs to. */
export function weekOf(day: number): { label: string; theme: string; question: string } {
  const t = THRESHOLDS.find((x) => day >= x.first && day < x.first + 2);
  if (t) return { label: t.theme, theme: t.theme, question: t.question };
  const w = [...WEEKS].reverse().find((x) => day >= x.first)!;
  return { label: `Week ${w.n}`, theme: w.theme, question: w.question };
}

/** The last day of each week: a check-in spread follows it. */
export const CHECKIN_AFTER = WEEKS.map((w) => w.first + 6);
