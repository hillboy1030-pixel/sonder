// Testers only: writes a real journal from the tester's own climb and report,
// and returns the print-ready interior and cover as PDFs. This is how we check
// Ember's real writing before the journal goes on sale.

import type { NextRequest } from "next/server";
import { limitRequest } from "@/lib/server/rateLimit";
import { isTester } from "@/lib/server/tester";
import { cleanContext, cleanScores } from "@/lib/server/validate";
import { generateJournal } from "@/lib/server/journal/generate";
import { renderCover, renderInterior } from "@/lib/server/journal/pdf";
import { aiErrorResponse } from "@/lib/server/aiErrors";

export const maxDuration = 300;

type Body = {
  tester?: string;
  scores?: unknown;
  context?: unknown;
  answers?: unknown;
  report?: unknown;
  firstName?: unknown;
  words?: unknown;
};

const cleanAnswers = (a: unknown): Record<number, number> | null => {
  if (!a || typeof a !== "object") return null;
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(a as Record<string, unknown>)) {
    const id = Number(k);
    if (Number.isInteger(id) && id > 0 && id < 200 && typeof v === "number" && v >= 1 && v <= 5) out[id] = Math.round(v);
  }
  return Object.keys(out).length ? out : null;
};

const cleanReport = (r: unknown) =>
  Array.isArray(r)
    ? r
        .slice(0, 9)
        .map((s) => ({ title: String((s as { title?: unknown })?.title ?? "").slice(0, 120), content: String((s as { content?: unknown })?.content ?? "").slice(0, 12000) }))
        .filter((s) => s.title && s.content)
    : [];

export async function POST(request: NextRequest) {
  const limited = limitRequest(request, "journal");
  if (limited) return limited;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isTester(body.tester)) return Response.json({ error: "Testers only." }, { status: 403 });

  const scores = cleanScores(body.scores);
  const report = cleanReport(body.report);
  if (!scores || report.length < 9) {
    return Response.json({ error: "Finish the climb and open your full report first." }, { status: 400 });
  }

  const firstName = (typeof body.firstName === "string" ? body.firstName : "").replace(/[^\p{L}\p{M}' .-]/gu, "").trim().slice(0, 30) || "Friend";
  const words = Array.isArray(body.words) ? body.words.filter((w): w is string => typeof w === "string").slice(0, 4).map((w) => w.slice(0, 20)) : [];

  try {
    const t0 = Date.now();
    const content = await generateJournal({
      scores: scores as unknown as Record<string, unknown>,
      context: cleanContext(body.context) ?? null,
      answers: cleanAnswers(body.answers),
      report,
      firstName,
      words,
    });
    const interior = await renderInterior(content);
    const cover = await renderCover(content, interior.pages);
    return Response.json({
      pages: interior.pages,
      seconds: Math.round((Date.now() - t0) / 1000),
      interior: interior.pdf.toString("base64"),
      cover: cover.toString("base64"),
    });
  } catch (error) {
    console.error("[journal preview]", error);
    return aiErrorResponse(error);
  }
}
