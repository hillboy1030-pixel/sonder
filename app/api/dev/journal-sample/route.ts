// Development only: renders the sample journal so it can be checked by eye.
// /api/dev/journal-sample?part=interior|cover
import { NextRequest } from "next/server";
import { generateJournal } from "@/lib/server/journal/generate";
import { renderCover, renderInterior } from "@/lib/server/journal/pdf";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
  const part = request.nextUrl.searchParams.get("part") ?? "interior";
  const content = await generateJournal({ scores: {}, context: null, report: [], firstName: "Jesse", words: [] });
  const t0 = Date.now();
  const interior = await renderInterior(content);
  const body = part === "cover" ? await renderCover(content, interior.pages) : interior.pdf;
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": "application/pdf", "X-Pages": String(interior.pages), "X-Render-Ms": String(Date.now() - t0) },
  });
}
