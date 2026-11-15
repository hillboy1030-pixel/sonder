// ─────────────────────────────────────────────────────────────────────────────
// Basecamp — the personal-context questions asked before the assessment.
//
// These are Sonder's own questions (not part of a validated instrument). They let
// the report speak to what the person is living through right now. Edit wording
// here; the assessment screens and the AI instructions read from this file.
// ─────────────────────────────────────────────────────────────────────────────

export type IntakeKind = "single" | "multi" | "text" | "longtext";

export type IntakeStep = {
  key: IntakeKey;
  kind: IntakeKind;
  prompt: string;
  help?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
};

export const INTAKE_KEYS = [
  "ageRange",
  "relationshipStatus",
  "hasChildren",
  "workField",
  "hobby",
  "clarityGoal",
  "lifeStage",
  "hardestThing",
  "socialPerception",
  "tooMuch",
  "worstSelf",
  "ninetyDayHope",
] as const;

export type IntakeKey = (typeof INTAKE_KEYS)[number];
export type SonderContext = Partial<Record<IntakeKey, string>>;

export const INTAKE_STEPS: IntakeStep[] = [
  {
    key: "ageRange",
    kind: "single",
    prompt: "How old are you?",
    options: ["Under 25", "25–34", "35–44", "45–54", "55+"],
  },
  {
    key: "relationshipStatus",
    kind: "single",
    prompt: "What's your relationship status?",
    options: ["Single", "In a relationship", "Married", "Divorced or separated", "Widowed"],
  },
  {
    key: "hasChildren",
    kind: "single",
    prompt: "Do you have children?",
    options: ["No", "Yes"],
  },
  {
    key: "workField",
    kind: "text",
    prompt: "What kind of work do you do?",
    placeholder: "e.g. nursing, sales, teaching, raising kids",
    maxLength: 100,
  },
  {
    key: "hobby",
    kind: "text",
    prompt: "Is there a skill or pursuit you've spent years refining?",
    help: "The report uses it as a lens for how you learn and grow.",
    placeholder: "e.g. chess, woodworking, distance running",
    maxLength: 150,
  },
  {
    key: "clarityGoal",
    kind: "multi",
    prompt: "What do you most want clarity on?",
    help: "Pick as many as fit.",
    options: ["My career direction", "My relationships", "Who I am as a person"],
    required: true,
  },
  {
    key: "lifeStage",
    kind: "single",
    prompt: "Where are you in life right now?",
    options: [
      "Building (new role, new relationship, new chapter)",
      "Navigating (transition, uncertainty, change)",
      "Rebuilding (after loss, divorce, or major shift)",
      "Deepening (established, seeking more meaning)",
    ],
  },
  {
    key: "hardestThing",
    kind: "longtext",
    prompt: "What's the hardest thing you're working through right now?",
    help: "A sentence is plenty. This shapes your report and your 90 days.",
    placeholder: "A career change, a relationship, a loss, a decision…",
    maxLength: 300,
  },
  {
    key: "socialPerception",
    kind: "text",
    prompt: "How do the people closest to you describe you?",
    placeholder: "They say I'm…",
    maxLength: 150,
  },
  {
    key: "tooMuch",
    kind: "text",
    prompt: "What's something about you that others haven't always understood?",
    placeholder: "My intensity, my need to help, my attention to detail…",
    maxLength: 150,
  },
  {
    key: "worstSelf",
    kind: "single",
    prompt: "When life gets hard, you tend to…",
    options: [
      "Withdraw and go quiet",
      "Push harder and control more",
      "Seek reassurance from others",
      "Distract yourself and stay busy",
      "Intellectualize and analyze everything",
    ],
    required: true,
  },
  {
    key: "ninetyDayHope",
    kind: "longtext",
    prompt: "Ninety days from now, what would you like to be different?",
    help: "This becomes the destination of your journey.",
    placeholder: "I'd like to…",
    maxLength: 300,
  },
];

export function joinClarityGoals(goals: string[]): string {
  const normalized = goals.map((g) => g.replace(/^My /, "").toLowerCase());
  if (normalized.length <= 1) return normalized[0] ?? "";
  if (normalized.length === 2) return `${normalized[0]} and ${normalized[1]}`;
  return `${normalized.slice(0, -1).join(", ")}, and ${normalized[normalized.length - 1]}`;
}
