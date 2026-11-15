"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import { ChapterIcon } from "@/components/ChapterIcon";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SupportNote } from "@/components/SupportNote";
import { contextNeedsCare } from "@/lib/safety";
import { GUIDE } from "@/lib/guide";
import { GuideLine } from "@/components/Guide";
import { KEYS, readJSON, writeJSON } from "@/lib/storage";
import { useStored } from "@/lib/useStored";
import { REPORT_PRICE_LABEL } from "@/lib/pricing";
import type { ChapterId } from "@/lib/chapters";
import { REPORT_SECTIONS } from "@/lib/reportSections";

type Insight = { title: string; insight: string };
type Marker = { chapter: ChapterId; headline: string; detail: string };

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
        note="This usually takes 15 to 30 seconds."
      />
    );
  }
  return <Preview insights={insights} />;
}

// ─── The preview ──────────────────────────────────────────────────────────────

function Preview({ insights }: { insights: Insight[] }) {
  const markers = useStored<Marker[]>(KEYS.markers) ?? [];
  const needsCare = contextNeedsCare(useStored<Record<string, string>>(KEYS.context));

  return (
    <div className="flex min-h-svh flex-col bg-mist">
      <SiteHeader cta={false} />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-5 pb-6 pt-28 sm:px-8 sm:pt-36">
          <p className="type-kicker">First light</p>
          <h1 className="type-h1 mt-3 text-ink">Three things I noticed about you.</h1>
          <GuideLine className="mt-6">{GUIDE.preview}</GuideLine>
          {needsCare && (
            <div className="mt-8">
              <SupportNote compact />
            </div>
          )}

          <ol className="mt-10 space-y-4">
            {insights.map((ins, i) => {
              const L = LENSES[i] ?? LENSES[0];
              return (
                <li
                  key={i}
                  className="glass rounded-panel p-6 animate-rise sm:p-8"
                  style={{ animationDelay: `${i * 140}ms` }}
                >
                  <p className="flex items-center gap-2 font-sign text-[0.95rem] font-medium text-pine-2">
                    <L.icon size={17} aria-hidden="true" />
                    {L.label}
                  </p>
                  <h2 className="type-h2 mt-3 text-ink">{ins.title}</h2>
                  <p className="mt-3 font-read text-[1.15rem] leading-[1.75] text-slate">{ins.insight}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <Unlock />

        {markers.length > 0 && (
          <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
            <h2 className="type-h2 text-ink">Your trail markers</h2>
            <p className="mt-2 text-slate">What showed up at the end of each chapter.</p>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2">
              {markers.map((m) => (
                <li key={m.chapter} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pine/10 text-pine">
                    <ChapterIcon id={m.chapter} size={20} />
                  </span>
                  <div>
                    <h3 className="font-sign text-[1.05rem] font-semibold text-ink">{m.headline}</h3>
                    <p className="mt-1 text-[0.98rem] text-slate">{m.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ShareBlock insights={insights} />

        <section className="border-t border-line bg-snow">
          <div className="mx-auto grid max-w-3xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[auto_1fr] md:items-start">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pine text-gold-hi">
              <BookOpen size={24} aria-hidden="true" />
            </span>
            <div>
              <p className="type-kicker">Coming soon</p>
              <h2 className="type-h2 mt-1 text-ink">The 90-day Sonder Journal</h2>
              <p className="mt-3 text-slate">
                Your report, turned into a printed journal with one small challenge a day.{" "}
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

// ─── Unlock ───────────────────────────────────────────────────────────────────

function Unlock() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/create-checkout", { method: "POST" });
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
            <GuideLine tone="dark" size="sm" className="mt-5">
              {GUIDE.unlock}
            </GuideLine>
            <p className="mt-4 text-snow/80">
              Nine sections that go far deeper than these three insights, including what you&rsquo;re
              carrying right now, and ending with your first 90 days.
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const host = useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => ""
  );

  const share = useCallback(async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 1, width: 1080, height: 1080, backgroundColor: "#213F35", logging: false });
      const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/png"));
      if (!blob) return;
      const file = new File([blob], "my-sonder-insights.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Sonder insights", text: `Come inward: ${window.location.origin}` });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "my-sonder-insights.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") console.error("Share failed:", err);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-8">
      <div className="flex flex-col items-start gap-5 rounded-panel border border-line bg-snow/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <h2 className="type-h3 text-ink">Know someone who&rsquo;d get this?</h2>
          <p className="mt-1 text-slate">Save your three insights as an image to share with one person.</p>
        </div>
        <button onClick={share} disabled={busy} className="btn btn-secondary btn-sm shrink-0">
          {busy ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Share2 size={17} aria-hidden="true" />}
          {busy ? "Making image" : "Share my insights"}
        </button>
      </div>

      {/* Off-screen card captured as the share image */}
      <div
        ref={cardRef}
        aria-hidden="true"
        className="fixed left-[-9999px] top-0 flex h-[1080px] w-[1080px] flex-col bg-pine p-[72px] text-snow"
      >
        <p className="font-sign text-[40px] font-bold">Sonder</p>
        <div className="mt-10 flex flex-1 flex-col gap-6">
          {insights.map((ins, i) => (
            <div key={i} className="flex flex-1 flex-col justify-center rounded-[24px] bg-white/[0.07] px-10 py-6">
              <p className="font-sign text-[30px] font-semibold text-gold-hi">{ins.title}</p>
              <p className="mt-3 font-read text-[24px] leading-[1.45] text-snow/90">{firstSentences(ins.insight, 2)}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 font-sign text-[24px] text-snow/60">Come inward. {host}</p>
      </div>
    </section>
  );
}

function firstSentences(text: string, n: number) {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  return parts ? parts.slice(0, n).join("").trim() : text;
}
