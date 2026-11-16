"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Backpack,
  BookOpen,
  Briefcase,
  Compass,
  Download,
  Eye,
  Heart,
  LoaderCircle,
  Mountain,
  PenLine,
  Printer,
  Route,
  Sunrise,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { WritingState, ProblemState } from "@/components/WritingState";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SupportNote } from "@/components/SupportNote";
import { contextNeedsCare } from "@/lib/safety";
import { GUIDE } from "@/lib/guide";
import { GuideLine } from "@/components/Guide";
import { Ember } from "@/components/Ember";
import { JournalPageMock } from "@/components/JournalBits";
import { TesterJournal } from "@/components/TesterJournal";
import { KEYS, readJSON, writeJSON } from "@/lib/storage";
import { useStored } from "@/lib/useStored";
import { REPORT_SECTIONS, type SectionIcon } from "@/lib/reportSections";

type Insight = { title: string; insight: string };
type Section = { title: string; content: string };
type Report = { sections: Section[] };

const MESSAGES = GUIDE.reportWriting;

const ICONS: Record<SectionIcon, LucideIcon> = {
  eye: Eye,
  backpack: Backpack,
  briefcase: Briefcase,
  heart: Heart,
  compass: Compass,
  route: Route,
  users: Users,
  mountain: Mountain,
  sunrise: Sunrise,
};

export default function ReportPage() {
  return (
    <Suspense fallback={null}>
      <ReportLoader />
    </Suspense>
  );
}

// ─── Loading, payment, and errors ─────────────────────────────────────────────

function ReportLoader() {
  const router = useRouter();
  const params = useSearchParams();
  const cached = useStored<Report>(KEYS.report);
  const cachedReport = cached?.sections?.length === 9 ? cached : null;
  const [fresh, setFresh] = useState<Report | null>(null);
  const report = fresh ?? cachedReport;
  const [problem, setProblem] = useState<{ title: string; message: string; retry: boolean; code?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(-1);

  useEffect(() => {
    if (cached === undefined || cachedReport || fresh) return;
    if (started.current === attempt) return;
    started.current = attempt;

    const fromUrl = params.get("session_id");
    if (fromUrl) writeJSON(KEYS.session, fromUrl);
    const sessionId = fromUrl ?? readJSON<string>(KEYS.session);

    if (!sessionId) {
      router.replace("/preview");
      return;
    }
    const scores = readJSON(KEYS.scores);
    if (!scores) {
      // Deferred so the effect doesn't set state synchronously.
      queueMicrotask(() => setProblem({
        title: "We can't find your answers",
        message:
          "Your answers are saved in the browser you took the assessment in. Open this page there, or email us with your receipt and we'll help.",
        retry: false,
      }));
      return;
    }

    fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scores,
        context: readJSON(KEYS.context),
        session_id: sessionId,
        tester: readJSON<string>(KEYS.tester) ?? undefined,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const err = new Error(data.error || "Your report didn't come through. Please try again.");
          (err as Error & { payment?: boolean; code?: string }).payment = data.code === "payment";
          (err as Error & { code?: string }).code = data.code;
          throw err;
        }
        return data as Report;
      })
      .then((data) => {
        writeJSON(KEYS.report, data);
        setFresh(data);
      })
      .catch((err: Error & { payment?: boolean; code?: string }) => {
        const offline = /fetch|network/i.test(err.message);
        setProblem({
          title: err.payment ? "We couldn't confirm your purchase" : "Your report didn't come through",
          message: offline ? "We couldn't reach Sonder. Check your connection and try again." : err.message,
          retry: true,
          code: err.payment ? undefined : err.code,
        });
      });
  }, [attempt, cached, cachedReport, fresh, params, router]);

  if (problem) {
    return (
      <ProblemState
        title={problem.title}
        message={problem.message}
        code={problem.code}
        primary={problem.retry ? { label: "Try again", onClick: () => (setProblem(null), setAttempt((a) => a + 1)) } : undefined}
        secondary={{ label: "Email us", href: "mailto:hello@sonder-me.com?subject=Sonder%20report%20help" }}
      />
    );
  }
  if (!report) {
    return (
      <WritingState
        title="Your guide is writing to you"
        messages={MESSAGES}
        seconds={150}
        note="This takes 2 to 3 minutes. Keep this page open."
      />
    );
  }
  return <FullReport report={report} />;
}

// ─── The report ───────────────────────────────────────────────────────────────

function FullReport({ report }: { report: Report }) {
  const insights = useStored<{ previewInsights: Insight[] }>(KEYS.preview)?.previewInsights ?? [];
  const needsCare = contextNeedsCare(useStored<Record<string, string>>(KEYS.context));
  const [downloading, setDownloading] = useState(false);
  const [active, setActive] = useState(0);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Highlight the section being read in the contents list.
  useEffect(() => {
    const els = report.sections.map((_, i) => document.getElementById(`section-${i + 1}`)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(Number(visible[0].target.id.split("-")[1]) - 1);
      },
      { rootMargin: "-20% 0px -65% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [report]);

  async function download() {
    setDownloading(true);
    try {
      const { generatePDF } = await import("@/lib/pdf");
      await generatePDF(report, insights);
    } catch (err) {
      console.error("PDF failed, falling back to print:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-mist">
      {/* Toolbar */}
      <header className="no-print sticky top-0 z-40 px-3 pt-3 sm:px-5">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[18px] py-2 pl-4 pr-2">
          <Logo />
          <div className="flex items-center gap-1.5">
            <button onClick={() => window.print()} className="btn btn-quiet btn-sm hidden sm:inline-flex">
              <Printer size={17} aria-hidden="true" />
              Print
            </button>
            <button onClick={download} disabled={downloading} className="btn btn-dark btn-sm">
              {downloading ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <Download size={17} aria-hidden="true" />}
              {downloading ? "Preparing PDF" : "Download PDF"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Title */}
        <section className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
          <p className="type-kicker">{today}</p>
          <h1 className="type-display mt-4 max-w-[12ch] text-ink">Your Sonder Report</h1>
          <GuideLine size="lg" className="mt-8 max-w-2xl">
            {GUIDE.reportOpen}
          </GuideLine>
          {needsCare && (
            <div className="no-print mt-8 max-w-2xl">
              <SupportNote compact />
            </div>
          )}
          <div className="no-print mt-8 max-w-2xl space-y-3 rounded-panel border border-gold/50 bg-gold/10 p-5 font-sign text-[0.95rem] leading-relaxed text-slate">
            <p>
              <strong className="text-ink">Save a copy now.</strong> Your report lives only in this
              browser. Download the PDF so you can keep it.
            </p>
            <p>
              Sonder is for self-reflection, not a diagnosis or a substitute for professional care. If
              you&rsquo;re in crisis, call or text <a className="font-semibold text-pine underline" href="tel:988">988</a> (US).
            </p>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[15rem_1fr] lg:gap-16">
          {/* Contents */}
          <nav aria-label="Report sections" className="no-print hidden lg:block">
            <ol className="sticky top-28 space-y-0.5">
              {report.sections.map((s, i) => {
                const meta = REPORT_SECTIONS[i];
                const Icon = meta ? ICONS[meta.icon] : Mountain;
                return (
                  <li key={i}>
                    <a
                      href={`#section-${i + 1}`}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 font-sign text-[0.95rem] transition-colors ${
                        active === i ? "bg-pine text-snow" : "text-slate hover:bg-pine/8 hover:text-ink"
                      }`}
                    >
                      <Icon size={16} aria-hidden="true" className={active === i ? "text-gold-hi" : ""} />
                      {meta?.title ?? s.title}
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>

          <article className="min-w-0 max-w-[40rem]">
            {insights.length > 0 && (
              <section className="mb-16">
                <h2 className="type-h3 text-ink">Where it started</h2>
                <p className="mt-1 text-slate">Your three first insights.</p>
                <ul className="mt-5 space-y-3">
                  {insights.map((ins, i) => (
                    <li key={i} className="rounded-2xl border border-line bg-snow/70 p-5">
                      <p className="font-sign text-[1.02rem] font-semibold text-pine">{ins.title}</p>
                      <p className="mt-1.5 text-[1.02rem] leading-relaxed text-slate">{ins.insight}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {report.sections.map((s, i) => (
              <ReportSection key={i} section={s} index={i} />
            ))}

            <div className="mt-20 flex flex-col items-center text-center">
              <Ember mood="pleased" size={88} title="Ember, your guide" />
              <p className="mt-4 font-read text-xl italic text-ink">{GUIDE.reportClose}</p>
              <p className="mt-1 font-sign text-sm font-semibold text-pine-2">Ember, your guide</p>
              <button onClick={download} disabled={downloading} className="no-print btn btn-dark mt-8">
                {downloading ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
                Download your report
              </button>
            </div>
          </article>
        </div>

        {/* Journal */}
        <section className="no-print relative isolate overflow-hidden bg-pine text-snow">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
            <div>
              <p className="type-kicker text-gold-hi">What comes next</p>
              <h2 className="type-h1 mt-2">Turn this report into 90 days.</h2>
              <p className="type-lede mt-4 max-w-lg text-snow/80">
                The Sonder Journal takes what you just read and gives you one small challenge a day to
                practice it, printed and shipped to you. It&rsquo;s nearly ready.
              </p>
              <div className="mt-8 max-w-lg">
                <WaitlistForm tone="dark" id="report-waitlist" />
              </div>
              <TesterJournal report={report.sections} />
            </div>
            <div className="hidden sm:block">
              <JournalPageMock />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// ─── One section ──────────────────────────────────────────────────────────────

function ReportSection({ section, index }: { section: Section; index: number }) {
  const meta = REPORT_SECTIONS[index];
  const Icon = meta ? ICONS[meta.icon] : Mountain;
  const isPlan = index === 8;

  return (
    <section id={`section-${index + 1}`} className={`scroll-mt-28 ${index > 0 ? "print-break mt-20 border-t border-line pt-14" : ""}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-pine text-gold-hi">
          <Icon size={20} aria-hidden="true" />
        </span>
        <span className="font-sign text-sm font-semibold tabular-nums text-stone">Section {index + 1} of 9</span>
      </div>
      <h2 className="type-h1 mt-4 text-ink">{meta?.title ?? section.title}</h2>
      <div className="prose-report mt-7 font-read text-[1.12rem] leading-[1.85] text-slate">
        {isPlan ? <PlanContent content={section.content} /> : <Paragraphs content={section.content} />}
      </div>
    </section>
  );
}

function Paragraphs({ content }: { content: string }) {
  const paras = content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p && !/^['"‘“]?you are sondering/i.test(p));
  return (
    <>
      {paras.map((p, i) =>
        /^\*\*[^*]+\*\*$/.test(p) ? (
          // A standalone bold line is a question to sit with.
          <p key={i} className="!my-4 border-l-[3px] border-gold py-1 pl-5 font-sign text-[1.2rem] font-semibold leading-snug text-ink">
            {p.slice(2, -2)}
          </p>
        ) : (
          <p key={i}>{bold(p)}</p>
        )
      )}
    </>
  );
}

/** Section 9: books, journal prompts, and daily practices. */
function PlanContent({ content }: { content: string }) {
  const lines = content.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const groups: { heading: string; items: string[] }[] = [];
  const intro: string[] = [];

  for (const line of lines) {
    // The closing line is shown once at the end of the report.
    if (/you are sondering/i.test(line)) continue;
    const heading = line.match(/^\*\*([^*]+)\*\*$/);
    if (heading && /books|prompts|practices/i.test(heading[1])) {
      groups.push({ heading: heading[1], items: [] });
    } else if (groups.length) {
      groups[groups.length - 1].items.push(line);
    } else {
      intro.push(line);
    }
  }

  if (!groups.length) return <Paragraphs content={content} />;

  const groupIcon = (h: string) => (/book/i.test(h) ? BookOpen : /prompt/i.test(h) ? PenLine : Sunrise);

  return (
    <>
      {intro.map((p, i) => (
        <p key={i}>{bold(p)}</p>
      ))}
      <div className="space-y-10">
        {groups.map((g) => {
          const G = groupIcon(g.heading);
          return (
            <div key={g.heading}>
              <h3 className="flex items-center gap-2 font-sign text-[1.2rem] font-semibold text-ink">
                <G size={19} className="text-pine-2" aria-hidden="true" />
                {g.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {g.items.map((it, i) => (
                  <li key={i} className="rounded-2xl border border-line bg-snow/70 px-5 py-4 text-[1.04rem] leading-relaxed">
                    {bold(it.replace(/^\d+\.\s*/, ""))}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

function bold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}
