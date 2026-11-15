// Cleans what the browser sends before it reaches the AI, so the routes can't be
// used to send arbitrary or oversized text.

import { INTAKE_KEYS } from "../intake";

const MAX_TEXT = 400;

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : null;
}

function numRecord(v: unknown, keys: readonly string[]): Record<string, number> | null {
  if (!v || typeof v !== "object") return null;
  const out: Record<string, number> = {};
  for (const k of keys) {
    const n = num((v as Record<string, unknown>)[k]);
    if (n === null) return null;
    out[k] = n;
  }
  return out;
}

const STRENGTHS = [
  "Creativity", "Curiosity", "Perspective", "Bravery", "Perseverance", "Honesty",
  "Zest", "Kindness", "Social Intelligence", "Teamwork", "Fairness", "Humility",
] as const;

export type CleanScores = {
  bigFive: Record<string, number>;
  holland: Record<string, number>;
  attachment: Record<string, number>;
  topStrengths: string[];
  allStrengths: Record<string, number>;
};

export function cleanScores(v: unknown): CleanScores | null {
  if (!v || typeof v !== "object") return null;
  const s = v as Record<string, unknown>;
  const bigFive = numRecord(s.bigFive, ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]);
  const holland = numRecord(s.holland, ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"]);
  const attachment = numRecord(s.attachment, ["Avoidance", "Anxiety"]);
  const allStrengths = numRecord(s.allStrengths, STRENGTHS);
  if (!bigFive || !holland || !attachment || !allStrengths) return null;
  const topStrengths = Array.isArray(s.topStrengths)
    ? s.topStrengths.filter((x): x is string => typeof x === "string" && (STRENGTHS as readonly string[]).includes(x)).slice(0, 5)
    : [];
  return { bigFive, holland, attachment, topStrengths, allStrengths };
}

export function cleanContext(v: unknown): Record<string, string> | undefined {
  if (!v || typeof v !== "object") return undefined;
  const out: Record<string, string> = {};
  for (const k of INTAKE_KEYS) {
    const val = (v as Record<string, unknown>)[k];
    if (typeof val === "string" && val.trim()) out[k] = val.trim().slice(0, MAX_TEXT);
  }
  return Object.keys(out).length ? out : undefined;
}
