"use client";

import { useState } from "react";
import { Check, LoaderCircle, Mail } from "lucide-react";

export function WaitlistForm({ tone = "dark", id = "waitlist" }: { tone?: "dark" | "light"; id?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const dark = tone === "dark";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't add you just now. Please try again.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't add you just now. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div
        role="status"
        className={`flex items-center gap-3 rounded-[16px] px-5 py-4 animate-rise ${dark ? "glass-dark text-snow" : "glass text-ink"}`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-ink animate-pop">
          <Check size={18} strokeWidth={2.5} aria-hidden="true" />
        </span>
        <p className="font-sign text-[1.02rem] leading-snug">
          You&rsquo;re on the list. We&rsquo;ll email you once, when the journal is ready.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full" noValidate>
      <label htmlFor={`${id}-email`} className={`mb-2 block font-sign text-[0.95rem] font-medium ${dark ? "text-snow/80" : "text-slate"}`}>
        Get one email when the journal launches
      </label>
      <div className={`flex flex-col gap-2 rounded-[18px] p-2 sm:flex-row ${dark ? "glass-dark" : "glass"}`}>
        <div className="relative flex-1">
          <Mail
            size={18}
            className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${dark ? "text-snow/50" : "text-stone"}`}
            aria-hidden="true"
          />
          <input
            id={`${id}-email`}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`h-12 w-full rounded-xl bg-transparent pl-11 pr-3 font-sign text-base outline-none placeholder:opacity-60 focus-visible:outline-none ${
              dark ? "text-snow placeholder:text-snow" : "text-ink placeholder:text-stone"
            }`}
          />
        </div>
        <button type="submit" disabled={state === "sending" || !email} className="btn btn-primary btn-sm h-12 px-5">
          {state === "sending" ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : null}
          {state === "sending" ? "Joining" : "Join the waitlist"}
        </button>
      </div>
      {state === "error" && (
        <p role="alert" className={`mt-2 font-sign text-sm ${dark ? "text-gold-hi" : "text-ember"}`}>
          {error}
        </p>
      )}
    </form>
  );
}
