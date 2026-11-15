// ─────────────────────────────────────────────────────────────────────────────
// Your cairn: one stone per chapter, shaped and colored by your answers.
// The four stone words together are a short, shareable portrait
// (e.g. "Curious · Helper · Devoted · Kindness").
// ─────────────────────────────────────────────────────────────────────────────

import type { Scores } from "./scoring";
import type { ChapterId } from "./chapters";

export type Stone = {
  chapter: Exclude<ChapterId, "basecamp">;
  word: string;
  meaning: string;
  color: string;
  seed: number;
};

const TERRAIN: Record<string, { high: [string, string, string]; low: [string, string, string] }> = {
  Openness: { high: ["Curious", "#6E7F94", "Drawn to new ideas and deep questions"], low: ["Grounded", "#7E8D86", "Trusts what's real and proven"] },
  Conscientiousness: { high: ["Steady", "#4B5B56", "Keeps promises and finishes things"], low: ["Free-spirited", "#8DA393", "Moves with the moment"] },
  Extraversion: { high: ["Bright", "#C9963F", "Comes alive around people"], low: ["Quiet", "#5E6E7C", "Thinks first, recharges alone"] },
  Agreeableness: { high: ["Warm", "#B98258", "Leads with care for others"], low: ["Direct", "#6B5B4E", "Says what they think"] },
  Neuroticism: { high: ["Deep-feeling", "#7A6A8C", "Feels things fully"], low: ["Calm", "#8FA0A9", "Stays steady when it's rough"] },
};

const PATH: Record<string, [string, string, string]> = {
  Realistic: ["Builder", "#8C7B63", "Happiest making real things work"],
  Investigative: ["Thinker", "#5D717E", "Needs to figure out how things work"],
  Artistic: ["Maker", "#946E86", "Needs to create something of their own"],
  Social: ["Helper", "#7F9A85", "Needs to help people grow"],
  Enterprising: ["Leader", "#B7804A", "Needs to move people toward a goal"],
  Conventional: ["Organizer", "#6E7F94", "Needs to bring order to things"],
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export function stoneFor(chapter: Stone["chapter"], scores: Scores): Stone {
  switch (chapter) {
    case "terrain": {
      const [trait, value] = Object.entries(scores.bigFive).sort((a, b) => Math.abs(b[1] - 60) - Math.abs(a[1] - 60))[0];
      const [word, color, meaning] = value >= 60 ? TERRAIN[trait].high : TERRAIN[trait].low;
      return { chapter, word, color, meaning, seed: hash(word + value) };
    }
    case "path": {
      const [type, value] = Object.entries(scores.holland).sort((a, b) => b[1] - a[1])[0];
      const [word, color, meaning] = PATH[type];
      return { chapter, word, color, meaning, seed: hash(word + value) };
    }
    case "company": {
      const { Avoidance: av, Anxiety: ax } = scores.attachment;
      const [word, color, meaning] =
        av < 55 && ax < 55
          ? ["Open", "#8FA393", "Lets people in with ease"]
          : av < 55
          ? ["Devoted", "#B98258", "Holds people close"]
          : ax < 55
          ? ["Self-reliant", "#5E6E7C", "Steady, with room of their own"]
          : ["Tender", "#9C7A8C", "Loves deeply, feels it all"];
      return { chapter, word, color, meaning, seed: hash(word + av + ax) };
    }
    case "carry": {
      const word = scores.topStrengths[0] ?? "Heart";
      return { chapter, word, color: "#C9963F", meaning: "The strength you carry most", seed: hash(word) };
    }
  }
}

export const STONE_CHAPTERS: Stone["chapter"][] = ["terrain", "path", "company", "carry"];

export function cairnFor(scores: Scores, chaptersDone: number): Stone[] {
  return STONE_CHAPTERS.slice(0, chaptersDone).map((c) => stoneFor(c, scores));
}

/** A smooth, slightly irregular stone outline, centered at 0,0. */
export function stonePath(width: number, height: number, seed: number): string {
  let s = seed || 1;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const n = 9;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const flat = Math.sin(a) > 0 ? 0.82 : 1; // flatter bottom so stones sit
    const r = 0.86 + rand() * 0.16;
    pts.push([Math.cos(a) * (width / 2) * r, Math.sin(a) * (height / 2) * r * flat]);
  }
  const mid = (p: [number, number], q: [number, number]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = "";
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    const m = mid(p, q);
    if (i === 0) {
      const m0 = mid(pts[n - 1], p);
      d += `M${m0[0].toFixed(1)} ${m0[1].toFixed(1)} `;
    }
    d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)} `;
  }
  return d + "Z";
}

/** Sizes and offsets for each stone, bottom to top. */
export function cairnLayout(stones: Stone[]) {
  const widths = [150, 124, 102, 82];
  const heights = [62, 54, 46, 40];
  let y = 0;
  return stones.map((stone, i) => {
    const w = widths[i];
    const h = heights[i];
    const jitter = ((stone.seed % 13) - 6) * 0.9;
    const tilt = ((stone.seed % 9) - 4) * 1.4;
    const cy = -(y + h / 2);
    y += h - 8;
    return { stone, w, h, cx: jitter, cy, tilt };
  });
}

export const CAIRN_TOTAL_HEIGHT = 62 + 54 + 46 + 40 - 24;
