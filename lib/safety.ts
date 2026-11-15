// ─────────────────────────────────────────────────────────────────────────────
// Safety screen for free-text answers.
//
// A simple word list, not a diagnosis. If anything matches, Sonder shows crisis
// resources right away and tells the AI to write gently, without analyzing
// those details. Reviewed wording belongs in the clinical review packet.
// ─────────────────────────────────────────────────────────────────────────────

const PATTERNS = [
  /\bsuicid/i,
  /\bkill(ing)? myself\b/i,
  /\bend (it all|my life)\b/i,
  /\b(want|wanted|wanting) to die\b/i,
  /\bdon'?t want to (live|be here|exist)\b/i,
  /\bno reason to live\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\bself[- ]?harm/i,
  /\b(hurt|hurting|cut|cutting) myself\b/i,
  /\boverdos/i,
  /\b(abuse[sd]?|abusive|abuser)\b/i,
  /\b(hits|hit|beats|beat|chokes|choked) me\b/i,
  /\bafraid for my (life|safety)\b/i,
  /\bnot safe at home\b/i,
];

export function mentionsCrisis(...texts: (string | undefined | null)[]): boolean {
  return texts.some((t) => !!t && PATTERNS.some((p) => p.test(t)));
}

/** Text fields in the context that the screen checks. */
export const SCREENED_KEYS = ["hardestThing", "socialPerception", "tooMuch", "ninetyDayHope", "workField", "hobby"] as const;

export function contextNeedsCare(context: Record<string, string> | null | undefined): boolean {
  if (!context) return false;
  return mentionsCrisis(...SCREENED_KEYS.map((k) => context[k]));
}
