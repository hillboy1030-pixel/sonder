"use client";

// Early access: Ember writes the reader's 90-day journal from this browser's
// climb and report, and hands it over as print-ready PDFs. When the printed
// journal goes on sale, this becomes the checkout.

import { useEffect, useRef, useState } from "react";
import { BookOpen, Download, LoaderCircle, RotateCcw } from "lucide-react";
import { KEYS, readJSON, remove, writeJSON } from "@/lib/storage";
import { useStored } from "@/lib/useStored";

type Stone = { word: string };
type Built = { interior: string; cover: string; pages: number; name: string };

/** What Ember is doing, by how long it's been writing. */
const STAGES: [number, string][] = [
  [0, "Reading your report"],
  [12, "Planning your ninety days"],
  [30, "Writing Ground, days 1 to 30"],
  [75, "Writing Climb, days 31 to 60"],
  [120, "Writing Return, days 61 to 90"],
  [165, "Writing your letters"],
  [200, "Setting the pages"],
];

function save(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

const slug = (name: string) => (name || "my").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my";

export function JournalBuilder({ report }: { report: { title: string; content: string }[] }) {
  const tester = useStored<string>(KEYS.tester);
  const saved = useStored<Built>(KEYS.journal);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fresh, setFresh] = useState<Built | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const built = fresh ?? saved ?? null;

  async function write() {
    setBusy(true);
    setError(null);
    setElapsed(0);
    const started = Date.now();
    timer.current = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    try {
      const res = await fetch("/api/journal/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tester,
          firstName: name.trim(),
          scores: readJSON(KEYS.scores),
          context: readJSON(KEYS.context),
          answers: readJSON(KEYS.answers),
          words: (readJSON<Stone[]>(KEYS.cairn) ?? []).map((s) => s.word),
          report,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.interior) {
        throw new Error(data.error ?? "Your journal didn't finish. Nothing was lost: try again.");
      }
      const result: Built = { interior: data.interior, cover: data.cover, pages: data.pages, name: name.trim() };
      setFresh(result);
      try {
        writeJSON(KEYS.journal, result); // so it can be downloaded again later
      } catch {
        /* storage full: the downloads below still work */
      }
      save(result.interior, `sonder-journal-${slug(result.name)}.pdf`);
    } catch (err) {
      const offline = err instanceof TypeError;
      setError(
        offline
          ? "The connection dropped while your journal was being written. Keep this page open and try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Try again."
      );
    } finally {
      if (timer.current) clearInterval(timer.current);
      setBusy(false);
    }
  }

  if (!tester) {
    return (
      <p className="mt-8 font-sign text-[0.98rem] text-snow/75">The printed journal opens soon.</p>
    );
  }

  if (built && !busy) {
    return (
      <div className="mt-8 max-w-lg rounded-2xl bg-snow/10 p-5 ring-1 ring-snow/20">
        <p className="font-sign text-[1.05rem] font-semibold">Your journal is ready.</p>
        <p className="mt-1 text-snow/75">
          {built.pages} pages, written for {built.name || "you"}. Read it on your phone or print it at home.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button onClick={() => save(built.interior, `sonder-journal-${slug(built.name)}.pdf`)} className="btn btn-primary btn-sm">
            <Download size={17} aria-hidden="true" />
            Download your journal
          </button>
          <button onClick={() => save(built.cover, `sonder-journal-${slug(built.name)}-cover.pdf`)} className="btn btn-glass btn-sm">
            <Download size={17} aria-hidden="true" />
            Download the cover
          </button>
        </div>
        <button
          onClick={() => {
            setFresh(null);
            remove(KEYS.journal);
            window.dispatchEvent(new StorageEvent("storage", { key: KEYS.journal }));
          }}
          className="mt-4 inline-flex items-center gap-1.5 font-sign text-sm text-snow/60 underline-offset-4 hover:text-snow hover:underline"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Write a new one
        </button>
      </div>
    );
  }

  const stage = [...STAGES].reverse().find(([t]) => elapsed >= t)?.[1] ?? STAGES[0][1];

  return (
    <div className="mt-8 max-w-lg rounded-2xl bg-snow/10 p-5 ring-1 ring-snow/20">
      <p className="font-sign text-[1.05rem] font-semibold">Free during early access</p>
      <p className="mt-1 text-snow/75">
        Your guide writes all ninety days from this report. It takes about three minutes; keep this page open while it writes.
      </p>
      {busy ? (
        <div className="mt-5" role="status" aria-live="polite">
          <p className="flex items-center gap-2 font-sign font-semibold text-gold-hi">
            <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
            {stage}
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-snow/15">
            <div className="h-full rounded-full bg-gold-hi transition-[width] duration-1000" style={{ width: `${Math.min(96, (elapsed / 210) * 100)}%` }} />
          </div>
          <p className="mt-2 font-sign text-sm text-snow/60">
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")} · Keep this page open
          </p>
        </div>
      ) : (
        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            write();
          }}
        >
          <label className="sr-only" htmlFor="journal-name">
            What should your guide call you?
          </label>
          <input
            id="journal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should your guide call you?"
            maxLength={30}
            autoComplete="given-name"
            className="min-h-12 flex-1 rounded-xl border border-snow/30 bg-snow/10 px-4 text-snow placeholder:text-snow/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-hi"
          />
          <button type="submit" className="btn btn-primary">
            <BookOpen size={18} aria-hidden="true" />
            Write my journal
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-3 font-sign text-sm text-[#F6C7B5]">
          {error}
        </p>
      )}
    </div>
  );
}
