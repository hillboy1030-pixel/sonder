"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Compass,
  Download,
  Eye,
  LoaderCircle,
  Lock,
  ShieldCheck,
  Share2,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WritingState, ProblemState } from "@/components/WritingState";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SupportNote } from "@/components/SupportNote";
import { contextNeedsCare } from "@/lib/safety";
import { GUIDE } from "@/lib/guide";
import { GuideLine } from "@/components/Guide";
import { Ember, EmberAvatar } from "@/components/Ember";
import type { Stone } from "@/lib/cairn";
import { KEYS, readJSON, writeJSON } from "@/lib/storage";
import { useStored } from "@/lib/useStored";
import { REPORT_PRICE_LABEL } from "@/lib/pricing";
import { REPORT_SECTIONS } from "@/lib/reportSections";

type Insight = { title: string; insight: string; shareLine?: string };

const MESSAGES = GUIDE.previewWriting;

const LENSES = [
  { icon: Eye, label: "The voice inside" },
  { icon: Users, label: "How others see you" },
  { icon: Compass, label: "What drives you" },
];


export default function PreviewPage() {
  const router = useRouter();
  const cached = useStored<{ previewInsights: Insight[] }>(KEYS.preview);
  const cachedInsights = cached?.previewInsights?.length === 3 ? cached.previewInsights : null;
  const [fresh, setFresh] = useState<Insight[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [errorDetail, setErrorDetail] = useState<string | undefined>();
  const [attempt, setAttempt] = useState(0);
  const started = useRef(-1);
  const insights = fresh ?? (attempt === 0 ? cachedInsights : null);

  useEffect(() => {
    if (cached === undefined) return; // not hydrated yet
    if (attempt === 0 && cachedInsights) return;
    if (started.current === attempt) return;
    started.current = attempt;

    const scores = readJSON(KEYS.scores);
    if (!scores) {
      router.replace("/assessment");
      return;
    }
    fetch("/api/generate-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores, context: readJSON(KEYS.context) }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setErrorCode(data.code);
          setErrorDetail(data.detail);
          throw new Error(data.error || "Your preview didn't come through. Please try again.");
        }
        return data as { previewInsights: Insight[] };
      })
      .then((data) => {
        writeJSON(KEYS.preview, data);
        setFresh(data.previewInsights);
      })
      .catch((err: Error) => {
        const offline = /fetch|network/i.test(err.message);
        setError(offline ? "We couldn't reach Sonder. Check your connection and try again." : err.message);
      });
  }, [attempt, cached, cachedInsights, router]);

  if (error) {
    return (
      <ProblemState
        title="Your insights didn't come through"
        message={error}
        code={errorCode}
        detail={errorDetail}
        primary={{ label: "Try again", onClick: () => (setError(null), setAttempt((a) => a + 1)) }}
        secondary={{ label: "Back to the assessment", href: "/assessment" }}
      />
    );
  }
  if (!insights) {
    return (
      <WritingState
        title="Your guide is reading"
        messages={MESSAGES}
        seconds={22}
        mood="thinking"
        note="This usually takes 15 to 30 seconds."
      />
    );
  }
  return <Preview insights={insights} />;
}

// ─── The preview ──────────────────────────────────────────────────────────────

function Preview({ insights }: { insights: Insight[] }) {
  const needsCare = contextNeedsCare(useStored<Record<string, string>>(KEYS.context));

  return (
    <div className="flex min-h-svh flex-col bg-mist">
      <SiteHeader cta={false} />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pb-6 pt-28 sm:px-8 sm:pt-36">
          <p className="type-kicker">First light</p>
          <h1 className="type-h1 mt-3 text-ink">Three things I noticed about you.</h1>
          <GuideLine className="mt-6" mood="pleased">{GUIDE.preview}</GuideLine>
          {needsCare && (
            <div className="mt-8">
              <SupportNote compact />
            </div>
          )}

          <ol className="mt-10 space-y-4">
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} index={i} />
            ))}
          </ol>
        </section>

        <ShareBlock insights={insights} />

        <Unlock />

        <section className="border-t border-line bg-snow">
          <div className="mx-auto grid max-w-3xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[auto_1fr] md:items-start">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pine text-gold-hi">
              <BookOpen size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="type-kicker">Coming soon</p>
              <h2 className="type-h2 mt-1 text-ink">The 90-day Sonder Journal</h2>
              <p className="mt-3 text-slate">
                Your report, turned into ninety days in a printed journal written just for you.{" "}
                <Link href="/journal" className="font-sign font-semibold text-pine underline-offset-4 hover:underline">
                  See what&rsquo;s inside
                </Link>
              </p>
              <div className="mt-6 max-w-lg">
                <WaitlistForm tone="light" id="preview-waitlist" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// ─── Insight cards that turn over ─────────────────────────────────────────────

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const [open, setOpen] = useState(false);
  const L = LENSES[index] ?? LENSES[0];
  return (
    <li className="flip-card" data-flipped={open}>
      <div className="flip-inner grid">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            if (typeof navigator !== "undefined") navigator.vibrate?.(10);
          }}
          aria-hidden={open}
          tabIndex={open ? -1 : 0}
          className="flip-face group col-start-1 row-start-1 flex min-h-[220px] w-full flex-col items-center justify-center gap-4 rounded-panel bg-pine p-6 text-center text-snow shadow-[0_24px_48px_-28px_rgb(22_46_38/0.8)] transition-transform duration-300 hover:-translate-y-1 sm:p-8"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 text-gold-hi transition-transform duration-300 group-hover:scale-110">
            <L.icon size={26} aria-hidden="true" />
          </span>
          <span className="font-sign text-[1.35rem] font-semibold">{L.label}</span>
          <span className="flex items-center gap-2 font-sign text-[0.95rem] text-snow/70">
            Tap to turn it over
          </span>
        </button>
        <div
          aria-hidden={!open}
          className="flip-face flip-back col-start-1 row-start-1 rounded-panel border border-white/70 bg-snow p-6 shadow-[0_24px_48px_-28px_rgb(22_46_38/0.45)] sm:p-8"
        >
          <p className="flex items-center gap-2 font-sign text-[0.95rem] font-medium text-pine-2">
            <L.icon size={17} aria-hidden="true" />
            {L.label}
          </p>
          <h2 className="type-h2 mt-3 text-ink">{insight.title}</h2>
          <p className="mt-3 font-read text-[1.15rem] leading-[1.75] text-slate">{insight.insight}</p>
        </div>
      </div>
    </li>
  );
}

// ─── Your cairn ───────────────────────────────────────────────────────────────

// ─── Unlock ───────────────────────────────────────────────────────────────────

function Unlock() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tester: readJSON<string>(KEYS.tester) ?? undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout couldn't open. Please try again.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout couldn't open. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="px-3 py-10 sm:px-6">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] bg-pine text-snow shadow-[0_40px_80px_-40px_rgb(20_40_32/0.8)]">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(237_183_92/0.35),transparent_65%)]" />
        <div className="relative grid gap-10 p-7 sm:p-10 md:grid-cols-[1fr_1.05fr] md:gap-12 md:p-12">
          <div>
            <p className="type-kicker text-gold-hi">The summit</p>
            <h2 className="type-h1 mt-2">Read your full report.</h2>
            <GuideLine tone="dark" size="sm" className="mt-5" mood="amused">
              {GUIDE.unlock}
            </GuideLine>
            <p className="mt-4 text-snow/80">
              Nine sections that go far deeper than these three insights, including what you&rsquo;re
              carrying right now, and ending with where to begin.
            </p>
            <p className="mt-7 flex items-baseline gap-2">
              <span className="font-sign text-6xl font-bold leading-none">{REPORT_PRICE_LABEL}</span>
              <span className="font-sign text-snow/70">one time</span>
            </p>
            <button onClick={checkout} disabled={loading} className="btn btn-primary mt-6 w-full sm:w-auto">
              {loading ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Lock size={17} aria-hidden="true" />}
              {loading ? "Opening secure checkout" : `Unlock my report for ${REPORT_PRICE_LABEL}`}
            </button>
            {error && (
              <p role="alert" className="mt-3 font-sign text-sm text-gold-hi">
                {error}
              </p>
            )}
            <ul className="mt-6 space-y-2 font-sign text-[0.92rem] text-snow/70">
              <li className="flex items-center gap-2">
                <ShieldCheck size={15} aria-hidden="true" /> Secure checkout by Stripe
              </li>
              <li className="flex items-center gap-2">
                <Clock size={15} aria-hidden="true" /> Written in 2 to 3 minutes, just for you
              </li>
              <li className="flex items-center gap-2">
                <Download size={15} aria-hidden="true" /> Download it as a PDF to keep
              </li>
            </ul>
          </div>
          <ol className="grid content-start gap-1.5 rounded-2xl bg-white/[0.06] p-3 sm:p-4" aria-label="What's in the full report">
            {REPORT_SECTIONS.map((sec, i) => (
              <li key={sec.title} className="flex items-center gap-3 rounded-xl px-2.5 py-2">
                <span className="w-6 text-right font-sign text-sm tabular-nums text-snow/45">{i + 1}</span>
                <span className="flex-1 font-sign text-[1.02rem] text-snow/90">{sec.title}</span>
                <Lock size={14} className="text-gold-hi/70" aria-hidden="true" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// ─── Share ────────────────────────────────────────────────────────────────────

function ShareBlock({ insights }: { insights: Insight[] }) {
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [sent, setSent] = useState(false);
  const emberRef = useRef<HTMLDivElement>(null);
  const cairn = useStored<Stone[]>(KEYS.cairn);

  const make = useCallback(async () => {
    setState("busy");
    try {
      const { drawInsightsCard } = await import("@/lib/shareImage");
      const blob = await drawInsightsCard({
        insights,
        words: cairn?.length === 4 ? cairn.map((s) => s.word) : [],
        emberSvg: emberRef.current?.querySelector("svg")?.outerHTML,
        host: window.location.host,
      });
      if (!blob) throw new Error("Could not draw the image");
      setImage({ blob, url: URL.createObjectURL(blob) });
      setState("idle");
    } catch (err) {
      console.error("Share failed:", err);
      setState("error");
    }
  }, [insights, cairn]);

  const close = useCallback(() => {
    setImage((img) => {
      if (img) URL.revokeObjectURL(img.url);
      return null;
    });
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-5 pb-4 pt-6 sm:px-8">
      <div ref={emberRef} hidden aria-hidden="true">
        <Ember mood="pleased" size={300} />
      </div>
      <div className="flex flex-col items-start gap-5 rounded-panel border border-line bg-snow/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div className="flex items-start gap-4">
          <EmberAvatar mood="pleased" size={46} />
          <div>
            <h2 className="type-h3 text-ink">Did any of these sound like you?</h2>
            <p className="mt-1 text-slate">
              {state === "error"
                ? "That didn't work. Please try again."
                : sent
                ? "Shared. Thank you for passing it on."
                : "Share a card of what I noticed. Only the short lines go on it, nothing private."}
            </p>
          </div>
        </div>
        <button onClick={make} disabled={state === "busy"} className="btn btn-secondary btn-sm shrink-0">
          {state === "busy" ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Share2 size={17} aria-hidden="true" />}
          {state === "busy" ? "Making your card" : "Share my insights"}
        </button>
      </div>
      {image && <ShareSheet image={image} onClose={close} onShared={() => setSent(true)} />}
    </section>
  );
}

function ShareSheet({ image, onClose, onShared }: { image: { blob: Blob; url: string }; onClose: () => void; onShared: () => void }) {
  const [busy, setBusy] = useState(false);
  const primary = useRef<HTMLButtonElement>(null);
  const file = new File([image.blob], "what-ember-noticed.png", { type: "image/png" });
  const canShare = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare?.({ files: [file] });

  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  async function go() {
    setBusy(true);
    if (canShare) {
      try {
        await navigator.share({ files: [file], title: "Three things Ember noticed about me", text: `What would Ember notice about you? ${window.location.origin}` });
        onShared();
        onClose();
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") console.error(err);
      }
    } else {
      const a = document.createElement("a");
      a.href = image.url;
      a.download = "what-ember-noticed.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      onShared();
      onClose();
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Your share card"
        className="flex max-h-full w-full max-w-sm flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt="Your share card: three things Ember noticed about you" className="max-h-[70svh] w-auto rounded-2xl shadow-2xl" />
        <p className="text-center font-sign text-sm text-snow/85">This is exactly what people will see.</p>
        <div className="flex w-full gap-3">
          <button onClick={onClose} className="btn btn-quiet flex-1 bg-snow/90">Not now</button>
          <button ref={primary} onClick={go} disabled={busy} className="btn btn-primary flex-1">
            {canShare ? <Share2 size={18} aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
            {canShare ? "Share" : "Save image"}
          </button>
        </div>
      </div>
    </div>
  );
}
