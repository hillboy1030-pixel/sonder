"use client";

// Testers only: builds a real journal from this browser's climb and report,
// and downloads the print-ready interior and cover. Hidden for everyone else.

import { useState } from "react";
import { BookOpen, LoaderCircle } from "lucide-react";
import { KEYS, readJSON } from "@/lib/storage";
import { useStored } from "@/lib/useStored";

type Stone = { word: string };

function download(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function TesterJournal({ report }: { report: { title: string; content: string }[] }) {
  const tester = useStored<string>(KEYS.tester);
  const [name, setName] = useState("");
  const [state, setState] = useState<{ status: "idle" | "busy" | "done" | "error"; message?: string }>({ status: "idle" });

  if (!tester) return null;

  async function build() {
    setState({ status: "busy" });
    try {
      const res = await fetch("/api/journal/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tester,
          firstName: name,
          scores: readJSON(KEYS.scores),
          context: readJSON(KEYS.context),
          answers: readJSON(KEYS.answers),
          words: (readJSON<Stone[]>(KEYS.cairn) ?? []).map((s) => s.word),
          report,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Failed (${res.status})`);
      const slug = (name || "my").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      download(data.interior, `sonder-journal-${slug}-interior.pdf`);
      download(data.cover, `sonder-journal-${slug}-cover.pdf`);
      setState({ status: "done", message: `${data.pages} pages, written in ${data.seconds} seconds. Two PDFs downloaded.` });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  return (
    <div className="mt-8 max-w-lg rounded-2xl border border-dashed border-snow/35 p-5">
      <p className="font-sign text-sm font-semibold text-gold-hi">Tester only</p>
      <p className="mt-1 text-snow/80">Build the real journal from your climb. Ember writes all ninety days; it takes about two to four minutes.</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="tester-journal-name">
          What should Ember call you?
        </label>
        <input
          id="tester-journal-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What should Ember call you?"
          maxLength={30}
          className="min-h-11 flex-1 rounded-xl border border-snow/30 bg-snow/10 px-4 text-snow placeholder:text-snow/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-hi"
        />
        <button onClick={build} disabled={state.status === "busy"} className="btn btn-primary btn-sm">
          {state.status === "busy" ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <BookOpen size={17} aria-hidden="true" />}
          {state.status === "busy" ? "Ember is writing" : "Build my journal"}
        </button>
      </div>
      {state.message && (
        <p className={`mt-3 text-sm ${state.status === "error" ? "text-[#F3B3A0]" : "text-snow/80"}`} role="status">
          {state.message}
        </p>
      )}
    </div>
  );
}
