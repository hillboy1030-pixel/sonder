import { SECTIONS } from "./questions";

export type Scores = {
  bigFive: {
    Openness: number;
    Conscientiousness: number;
    Extraversion: number;
    Agreeableness: number;
    Neuroticism: number;
  };
  holland: {
    Realistic: number;
    Investigative: number;
    Artistic: number;
    Social: number;
    Enterprising: number;
    Conventional: number;
  };
  attachment: {
    Avoidance: number;
    Anxiety: number;
  };
  topStrengths: string[];
  allStrengths: Record<string, number>;
};

export function calculateScores(answers: Record<number, number>): Scores {
  function getScore(id: number, reverse: boolean): number {
    const raw = answers[id] ?? 3;
    return reverse ? 6 - raw : raw;
  }

  function toPercentile(raw: number, itemCount: number): number {
    // max possible = itemCount × 5
    return Math.round((raw / (itemCount * 5)) * 100);
  }

  // ── Big Five (Section 0, Q1–30) ──────────────────────────────────────────
  const bfSection = SECTIONS[0];
  const bfDimensions = [
    "Neuroticism",
    "Extraversion",
    "Openness",
    "Agreeableness",
    "Conscientiousness",
  ] as const;

  const bigFive = {} as Scores["bigFive"];
  for (const dim of bfDimensions) {
    const items = bfSection.questions.filter((q) => q.dimension === dim);
    const raw = items.reduce((sum, q) => sum + getScore(q.id, q.reverse), 0);
    bigFive[dim] = toPercentile(raw, items.length);
  }

  // ── Holland Code (Section 1, Q31–48) ────────────────────────────────────
  const hollandSection = SECTIONS[1];
  const hollandTypes = [
    "Realistic",
    "Investigative",
    "Artistic",
    "Social",
    "Enterprising",
    "Conventional",
  ] as const;

  const holland = {} as Scores["holland"];
  for (const type of hollandTypes) {
    const items = hollandSection.questions.filter((q) => q.dimension === type);
    const raw = items.reduce((sum, q) => sum + getScore(q.id, q.reverse), 0);
    holland[type] = toPercentile(raw, items.length);
  }

  // ── Attachment Style (Section 2, Q49–60) ────────────────────────────────
  const ecrSection = SECTIONS[2];
  const avoidanceItems = ecrSection.questions.filter((q) => q.dimension === "Avoidance");
  const anxietyItems   = ecrSection.questions.filter((q) => q.dimension === "Anxiety");

  const attachment: Scores["attachment"] = {
    Avoidance: toPercentile(
      avoidanceItems.reduce((sum, q) => sum + getScore(q.id, q.reverse), 0),
      avoidanceItems.length
    ),
    Anxiety: toPercentile(
      anxietyItems.reduce((sum, q) => sum + getScore(q.id, q.reverse), 0),
      anxietyItems.length
    ),
  };

  // ── VIA Strengths (Section 3, Q61–72) ───────────────────────────────────
  const viaSection = SECTIONS[3];
  const allStrengths: Record<string, number> = {};
  for (const q of viaSection.questions) {
    allStrengths[q.dimension] = answers[q.id] ?? 3;
  }

  const topStrengths = Object.entries(allStrengths)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name]) => name);

  return { bigFive, holland, attachment, topStrengths, allStrengths };
}
