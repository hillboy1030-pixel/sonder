"use client";

import { useEffect, useState } from "react";
import { CircleAlert, RotateCcw } from "lucide-react";
import { Logo } from "./Logo";
import { MountainScene } from "./MountainScene";

/**
 * Shown while the AI writes. The bar moves toward (but never claims) completion
 * over the expected time; the messages say what's happening in plain words.
 */
export function WritingState({
  title,
  messages,
  seconds,
  note,
}: {
  title: string;
  messages: string[];
  seconds: number;
  note: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - start) / 1000), 250);
    return () => clearInterval(id);
  }, []);

  // Eases toward 95% so a slow response never looks "stuck at 100".
  const pct = Math.min(95, 100 * (1 - Math.exp((-2.2 * elapsed) / seconds)));
  const msg = messages[Math.min(messages.length - 1, Math.floor((elapsed / seconds) * messages.length))];

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[linear-gradient(180deg,#1A2B36_0%,#3E5A6C_45%,#9AA49B_75%,#E3C38D_100%)] text-snow">
      <MountainScene className="pointer-events-none absolute inset-x-0 bottom-0 h-[42vh] w-full" />
      <header className="relative z-10 px-6 pt-6">
        <Logo tone="light" />
      </header>
      <main className="relative z-10 flex flex-1 items-start justify-center px-5 pt-[12vh]">
        <div className="glass-dark w-full max-w-lg rounded-panel p-8 text-center sm:p-10" role="status" aria-live="polite">
          <span className="mx-auto block h-14 w-14 rounded-full bg-[radial-gradient(circle,#FBE3AE_0%,#E2A23B_55%,transparent_72%)] animate-breathe" aria-hidden="true" />
          <h1 className="type-h2 mt-6">{title}</h1>
          <p key={msg} className="mt-3 min-h-[3.4em] font-read text-lg italic text-snow/85 animate-fade">
            {msg}
          </p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-4 font-sign text-sm text-snow/65">{note}</p>
        </div>
      </main>
    </div>
  );
}

export function ProblemState({
  title,
  message,
  primary,
  secondary,
  code,
  detail,
}: {
  title: string;
  message: string;
  code?: string;
  detail?: string;
  primary?: { label: string; onClick?: () => void; href?: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div className="flex min-h-svh flex-col bg-mist">
      <header className="px-6 pt-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-5 pt-[14vh]">
        <div className="glass w-full max-w-lg rounded-panel p-8 sm:p-10" role="alert">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ember/12 text-ember">
            <CircleAlert size={24} aria-hidden="true" />
          </span>
          <h1 className="type-h2 mt-5 text-ink">{title}</h1>
          <p className="mt-3 text-slate">{message}</p>
          {code && (
            <p className="mt-2 font-sign text-xs text-stone">
              Error code: {code}
              {detail ? ` (${detail})` : ""}
            </p>
          )}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            {primary &&
              (primary.href ? (
                <a href={primary.href} className="btn btn-dark">
                  {primary.label}
                </a>
              ) : (
                <button onClick={primary.onClick} className="btn btn-dark">
                  <RotateCcw size={17} aria-hidden="true" />
                  {primary.label}
                </button>
              ))}
            {secondary && (
              <a href={secondary.href} className="btn btn-secondary">
                {secondary.label}
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
