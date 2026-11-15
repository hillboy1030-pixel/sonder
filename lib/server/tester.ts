import { timingSafeEqual } from "crypto";

/**
 * Pre-launch tester access. Set SONDER_TESTER_CODE in Vercel (8+ characters)
 * and share https://<site>/?tester=<code>. Anyone with that link can open full
 * reports without paying. Delete the variable before launch to turn it off.
 */
export function isTester(code: unknown): boolean {
  const secret = process.env.SONDER_TESTER_CODE ?? "";
  if (secret.length < 8 || typeof code !== "string") return false;
  const a = Buffer.from(code);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
