// The nine sections of the full report, in order. Titles match what the AI is
// instructed to write in lib/prompts.ts.

export const REPORT_SECTIONS = [
  { title: "Who you are", icon: "user" },
  { title: "How you work", icon: "briefcase" },
  { title: "How you love", icon: "heart" },
  { title: "What drives you", icon: "compass" },
  { title: "Your growth edges", icon: "sprout" },
  { title: "Your path forward", icon: "route" },
  { title: "The Sonder lens", icon: "eye" },
  { title: "The whole picture", icon: "mountain" },
  { title: "Your next 90 days", icon: "sunrise" },
] as const;

export type SectionIcon = (typeof REPORT_SECTIONS)[number]["icon"];
