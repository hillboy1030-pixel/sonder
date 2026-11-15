// ─────────────────────────────────────────────────────────────────────────────
// The climb: how the assessment is divided into chapters, and the short
// "trail marker" each person sees when they finish one. Trail markers are
// written here, by hand, from the scores (no AI involved).
// ─────────────────────────────────────────────────────────────────────────────

import type { Scores } from "./scoring";

export type ChapterId = "basecamp" | "terrain" | "path" | "company" | "carry";

export type Chapter = {
  id: ChapterId;
  name: string;
  topic: string;
  intro: string;
  /** Index into SECTIONS in questions.ts (basecamp has none). */
  sectionIndex: number | null;
};

export const CHAPTERS: Chapter[] = [
  {
    id: "basecamp",
    name: "Basecamp",
    topic: "Where you are in life",
    intro: "A few questions about your life right now. They help the report speak to you, not someone like you.",
    sectionIndex: null,
  },
  {
    id: "terrain",
    name: "The terrain",
    topic: "Your personality",
    intro: "Twenty short statements about how you tend to think and feel.",
    sectionIndex: 0,
  },
  {
    id: "path",
    name: "The path",
    topic: "Work you're drawn to",
    intro: "Twelve activities. Rate how much you'd enjoy each one, whether or not you've done it.",
    sectionIndex: 1,
  },
  {
    id: "company",
    name: "The company you keep",
    topic: "How you do closeness",
    intro: "Twelve statements about your close relationships: partners, family, and friends.",
    sectionIndex: 2,
  },
  {
    id: "carry",
    name: "What you carry",
    topic: "Your strengths",
    intro: "The last stretch. Twelve statements about the strengths you bring with you.",
    sectionIndex: 3,
  },
];

export type TrailMarker = { headline: string; detail: string };

const BIG_FIVE_LINES: Record<string, { high: string; low: string }> = {
  Openness: {
    high: "New ideas pull at you. You'd rather understand something deeply than just get it done.",
    low: "You trust what's proven. You'd rather do a familiar thing well than chase a new one.",
  },
  Conscientiousness: {
    high: "You keep your word and finish what you start. People rely on you, sometimes more than you'd like.",
    low: "You move with the moment more than the plan, and you're at your best when there's room to improvise.",
  },
  Extraversion: {
    high: "People give you energy. You think out loud and come alive in a full room.",
    low: "You recharge alone and think before you speak. Your best conversations happen one on one.",
  },
  Agreeableness: {
    high: "You lead with warmth and give people the benefit of the doubt, often before you give it to yourself.",
    low: "You say what you think and don't need everyone to agree. People know where they stand with you.",
  },
  Neuroticism: {
    high: "You feel things strongly and notice what could go wrong. That sensitivity is also how you catch what others miss.",
    low: "You stay steady when things get rough. Stress tends to roll off rather than stick.",
  },
};

const HOLLAND_NAMES: Record<string, string> = {
  Realistic: "builder",
  Investigative: "thinker",
  Artistic: "maker",
  Social: "helper",
  Enterprising: "leader",
  Conventional: "organizer",
};

export function trailMarkerFor(chapter: ChapterId, scores: Scores): TrailMarker | null {
  switch (chapter) {
    case "terrain": {
      const entries = Object.entries(scores.bigFive);
      // The trait furthest from the middle says the most about this person.
      const [trait, value] = entries.sort((a, b) => Math.abs(b[1] - 60) - Math.abs(a[1] - 60))[0];
      const line = BIG_FIVE_LINES[trait];
      return { headline: "Your terrain is taking shape", detail: value >= 60 ? line.high : line.low };
    }
    case "path": {
      const top = Object.entries(scores.holland).sort((a, b) => b[1] - a[1]).slice(0, 2);
      return {
        headline: `Part ${HOLLAND_NAMES[top[0][0]]}, part ${HOLLAND_NAMES[top[1][0]]}`,
        detail: "That's the kind of work that draws you. Your report explains what it needs to give back to you.",
      };
    }
    case "company": {
      const { Avoidance: av, Anxiety: ax } = scores.attachment;
      const closeEasy = av < 55;
      const settled = ax < 55;
      const detail = closeEasy && settled
        ? "Closeness tends to feel natural to you, and you don't spend much energy worrying about it."
        : closeEasy && !settled
        ? "You value closeness deeply, and you notice quickly when it feels like it's slipping."
        : !closeEasy && settled
        ? "You keep a little room for yourself in relationships, and you're steady inside them."
        : "Closeness matters to you and also asks a lot of you. Your report looks at that tension gently.";
      return { headline: "How you do closeness", detail };
    }
    case "carry": {
      const [a, b, c] = scores.topStrengths;
      return {
        headline: "What you carry",
        detail: `Your strongest signals are ${a.toLowerCase()}, ${b.toLowerCase()}, and ${c.toLowerCase()}.`,
      };
    }
    default:
      return null;
  }
}
