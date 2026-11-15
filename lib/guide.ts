// ─────────────────────────────────────────────────────────────────────────────
// Your guide's lines. Everything the guide says outside the AI-written report
// lives here so the voice stays consistent and is easy to edit.
//
// Voice: short sentences. Warm, plain, a little dry. Asks more than tells.
// Honest about patterns, gentle with people. Never flatters, never lectures.
// Name: Ember, a small, very old flame in a warm circle of light. The AI never describes itself or uses a gender for itself.
// ─────────────────────────────────────────────────────────────────────────────

import type { ChapterId } from "./chapters";

export const GUIDE = {
  welcome:
    "I'll walk with you the whole way. At the end of each stage I'll hand you a stone with one word for what I saw. Answer honestly, not impressively. There are no wrong turns up here.",
  welcomeBack: "You came back. Good. Let's pick up the trail where you left it.",
  chapterIntro: {
    basecamp: "Before we climb, tell me where you're starting from.",
    terrain: "First, the ground you're standing on. Don't think too long. Your first answer is usually the honest one.",
    path: "Now the work that pulls at you. Forget what you're good at for a minute. What would you actually enjoy?",
    company: "This stretch is about the people closest to you. Answer for how you are, not how you wish you were.",
    carry: "Last climb. Everyone carries something useful up this mountain. Let's see what's in your pack.",
  } satisfies Record<ChapterId, string>,
  summit: "That's the whole climb. Give me a moment with your answers, and I'll tell you the first three things I see.",
  preview:
    "I've read your answers. These are the first three things I noticed. If one of them lands, stay with it for a minute before you move on.",
  unlock: "There's a lot more I want to tell you. The full report is where I say it.",
  previewWriting: [
    "Give me a minute with your answers…",
    "Looking at where your answers meet…",
    "Thinking about what you told me at basecamp…",
    "Writing down the first three things I see…",
  ],
  reportWriting: [
    "Sit with me a few minutes. I'm writing to you…",
    "Starting with what I see in you…",
    "Thinking about what you're carrying…",
    "Writing about your work and the people you love…",
    "Finding the places you tend to get stuck…",
    "Looking at how you read other people…",
    "Naming the paradox you carry…",
    "Choosing your first steps for the next 90 days…",
    "Reading it all back one more time…",
  ],
  reportOpen: "I read everything you shared. Here's what I see. Take your time with it.",
  reportClose: "You are sondering. That is enough.",
  journal: "Ninety days is long enough to change a habit and short enough to begin today. I'll be on every page.",
};
