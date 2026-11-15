// ─────────────────────────────────────────────────────────────────────────────
// Ember's reactions during the climb.
//
// Every few answers, at moments you can't predict, Ember says something small
// about what you just did. Most answers get nothing, so the ones that land feel
// earned. Written by hand, chosen by rules; no AI involved, no cost.
// Tone: warm, dry, observant. Never judges. Relationship items get only gentle
// acknowledgments, never interpretation.
// ─────────────────────────────────────────────────────────────────────────────

import type { EmberMood } from "@/components/Ember";
import type { Question } from "./questions";

export type Reaction = { line: string; mood: EmberMood };

type Lines = { high?: string[]; low?: string[] };

// Keyed by the statement text so wording edits in questions.ts keep working
// as long as the statement is unchanged.
const ITEM_LINES: Record<string, Lines> = {
  "I am the life of the party.": { high: ["I had a feeling.", "The room gets louder when you walk in. Good."], low: ["The quiet ones see the most."] },
  "I don't talk a lot.": { high: ["Fewer words. More weight on each one."], low: ["You think out loud. I like that."] },
  "I have a vivid imagination.": { high: ["A vivid imagination. I could tell."], low: ["Feet on the ground. Someone has to."] },
  "I like order.": { high: ["Everything in its place. Including you, I suspect."], low: ["Order isn't your religion. Noted."] },
  "I get upset easily.": { high: ["You feel things fast. That's not a flaw up here."], low: ["Steady. The weather doesn't move you much."] },
  "I am relaxed most of the time.": { high: ["Easy in your own skin. That's rarer than you'd think."] },
  "I feel others' emotions.": { high: ["You feel the whole room. That's a lot to carry some days."] },
  "I sympathize with others' feelings.": { high: ["A soft heart. Keep it."] },
  "I make a mess of things.": { high: ["Honest answer. Most people round that one up."] },
  "I get chores done right away.": { high: ["Done before anyone asks. Of course."], low: ["Some things can wait. You know that already."] },
  "I seldom feel blue.": { low: ["Thank you for being honest about that one."] },
  "Start your own business.": { high: ["There it is. The itch to build your own."] },
  "Help people with their personal problems.": { high: ["People bring you their heavy things, don't they?"] },
  "Teach someone how to do something.": { high: ["A teacher. I could have guessed."] },
  "Write a story, song, or poem.": { high: ["A maker. Good to know."] },
  "Create a work of art.": { high: ["Hands that want to make something. Noted."] },
  "Fix a broken appliance or piece of furniture.": { high: ["You like things that work. Me too."] },
  "Keep track of financial records or expenses.": { high: ["Someone who reads the receipts. Respect."], low: ["Spreadsheets aren't your mountain. Fair."] },
  "Do scientific research to answer a question.": { high: ["You want to know why. Always why."] },
  "Lead a team to reach a goal.": { high: ["Others follow you up the hill, I think."] },
  "I worry about being abandoned by those I care about.": { high: ["Thank you for trusting me with that one."] },
  "I find it difficult to depend on other people.": { high: ["Carrying your own pack. Hm."] },
  "I often feel a strong need for reassurance from others.": { high: ["That took honesty. Keep going."] },
  "I am very comfortable being close to others.": { high: ["Closeness comes easy. That's a gift."] },
  "I finish whatever I start.": { high: ["A finisher. Rare."], low: ["A few open trails. We'll talk about that."] },
  "I stand up for what I believe in, even if it's unpopular.": { high: ["Brave. I like that."] },
  "People often come to me for advice.": { high: ["Of course they do."] },
  "I let my accomplishments speak for themselves.": { high: ["Quiet confidence. My favorite kind."] },
  "I approach life with excitement and energy.": { high: ["I can feel that from here."] },
  "I find the world a very interesting place.": { high: ["Curious. Good. That's half the climb."] },
};

// Items in this list get only gentle acknowledgments.
const TENDER_DIMENSIONS = new Set(["Anxiety", "Avoidance", "Neuroticism"]);

const FAST = ["You didn't hesitate on that one.", "No pause at all. Noted.", "That one you knew."];
const SLOW = ["You took your time there. That usually means it's complicated.", "Hm. That one made you think."];
const CONTRADICTION = [
  "Interesting. That doesn't quite match an earlier answer. People are like that.",
  "That one pulls against something you said before. Both can be true.",
];
const STEADY = ["Keep going. You're doing this honestly.", "Good pace. Don't overthink it.", "I'm listening."];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type ReactionState = { sinceLast: number; used: Set<string> };

export function newReactionState(): ReactionState {
  return { sinceLast: 0, used: new Set() };
}

/**
 * Decide whether Ember says something after this answer. Returns null most of
 * the time. Mutates `state`.
 */
export function reactTo(
  q: Question,
  value: number,
  ms: number,
  answers: Record<number, number>,
  sectionQuestions: Question[],
  state: ReactionState
): Reaction | null {
  state.sinceLast += 1;
  if (state.sinceLast < 3) return null;

  // The longer it's been, the more likely Ember speaks (variable reward).
  const chance = Math.min(0.85, 0.18 + (state.sinceLast - 3) * 0.14);
  if (Math.random() > chance) return null;

  const extreme = value === 1 || value === 5;
  const tender = TENDER_DIMENSIONS.has(q.dimension);
  const candidates: Reaction[] = [];

  const lines = ITEM_LINES[q.text];
  if (lines && extreme) {
    const set = value === 5 ? lines.high : lines.low;
    if (set) candidates.push({ line: pick(set), mood: tender ? "gentle" : value === 5 ? "pleased" : "amused" });
  }

  if (!tender) {
    // Answers that pull against a same-dimension answer given earlier.
    const effective = (qq: Question, v: number) => (qq.reverse ? 6 - v : v);
    const mine = effective(q, value);
    const clash = sectionQuestions.some(
      (o) => o.id !== q.id && o.dimension === q.dimension && answers[o.id] !== undefined && Math.abs(effective(o, answers[o.id]) - mine) >= 3
    );
    if (clash) candidates.push({ line: pick(CONTRADICTION), mood: "curious" });
    if (extreme && ms < 1400) candidates.push({ line: pick(FAST), mood: "amused" });
    if (ms > 9000) candidates.push({ line: pick(SLOW), mood: "thinking" });
  }

  if (!candidates.length && state.sinceLast >= 7) candidates.push({ line: pick(STEADY), mood: "listening" });

  const fresh = candidates.filter((c) => !state.used.has(c.line));
  if (!fresh.length) return null;
  const chosen = fresh[0];
  state.used.add(chosen.line);
  state.sinceLast = 0;
  return chosen;
}
