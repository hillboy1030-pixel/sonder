// The nine sections of the full report, in order. Titles match what the AI is
// instructed to write in lib/prompts.ts (the page shows these titles).

export const REPORT_SECTIONS = [
  { title: "What I see in you", icon: "eye" },
  { title: "What you're carrying", icon: "backpack" },
  { title: "The work that fits you", icon: "briefcase" },
  { title: "How you let people in", icon: "heart" },
  { title: "What you're really after", icon: "compass" },
  { title: "Where you get stuck", icon: "route" },
  { title: "Other people's trails", icon: "users" },
  { title: "The paradox you carry", icon: "mountain" },
  { title: "Where to begin", icon: "sunrise" },
] as const;

export type SectionIcon = (typeof REPORT_SECTIONS)[number]["icon"];
