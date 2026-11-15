import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Footprints,
  HeartHandshake,
  MessageCircleQuestion,
  ChevronDown,
  Clock,
  Eye,
  Flag,
  Mountain,
  ShieldCheck,
  Sunrise,
  Tent,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MountainScene } from "@/components/MountainScene";
import { WaitlistForm } from "@/components/WaitlistForm";
import { ChapterIcon } from "@/components/ChapterIcon";
import { JournalPageMock, JOURNAL_PHASES } from "@/components/JournalBits";
import { REPORT_PRICE_LABEL } from "@/lib/pricing";
import { GuideLine } from "@/components/Guide";
import { Ember } from "@/components/Ember";
import { REPORT_SECTIONS } from "@/lib/reportSections";
import type { ChapterId } from "@/lib/chapters";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader variant="overlay" />
      <Hero />
      <Guide />
      <Trail />
      <Chapters />
      <Journal />
      <Faq />
      <Closing />
      <SiteFooter />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#121F28_0%,#1D3242_26%,#3E5A6C_50%,#8E9A95_72%,#E3C38D_92%,#EFD3A2_100%)] text-snow">
      <MountainScene trail className="absolute inset-x-0 bottom-0 -z-10 h-[46svh] w-full sm:h-[58vh]" />
      <div className="mx-auto max-w-6xl px-6 pb-[48svh] pt-32 sm:px-8 sm:pb-[52vh] sm:pt-40 lg:pb-[46vh]">
        <p className="max-w-sm font-read text-[1.02rem] italic leading-relaxed text-snow/75 animate-fade">
          <span className="font-sign font-semibold not-italic text-gold-hi">sonder</span> (n.) the
          realization that each passerby has a life as vivid and complex as your own.
        </p>
        <h1 className="type-display mt-7 animate-rise">Come inward.</h1>
        <p className="type-lede mt-6 max-w-xl text-snow/85">
          Answer 56 research-backed questions and share what you&rsquo;re carrying right now. At the
          top, you&rsquo;ll get a written portrait of how you think, work, love, and grow.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/assessment" className="btn btn-primary">
            Start the climb
            <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
          </Link>
          <Link href="#trail" className="btn btn-glass">
            See how it works
          </Link>
        </div>
        <ul className="type-meta mt-8 flex flex-wrap gap-x-6 gap-y-2 text-snow/80">
          <li className="flex items-center gap-2">
            <Clock size={16} aria-hidden="true" /> About 12 minutes
          </li>
          <li className="flex items-center gap-2">
            <Eye size={16} aria-hidden="true" /> First three insights free
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck size={16} aria-hidden="true" /> Answers stay in your browser
          </li>
        </ul>
      </div>
    </section>
  );
}

// ─── Your guide ───────────────────────────────────────────────────────────────

const GUIDE_TRAITS = [
  { icon: HeartHandshake, title: "Honest, never harsh", body: "Names your patterns plainly and stays kind about it." },
  { icon: MessageCircleQuestion, title: "Asks before telling", body: "The best insights are the ones you find yourself. Ember asks the questions that get you there." },
  { icon: Footprints, title: "Always a next step", body: "Every insight comes with something small to try, today." },
];

function Guide() {
  return (
    <section className="border-b border-line/70 bg-snow">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-28">
        <div>
          <div className="flex items-end gap-5">
            <Ember mood="calm" size={96} className="shrink-0" title="Ember, your guide" />
            <h2 className="type-h1 pb-2 text-ink">A guide, not a grade.</h2>
          </div>
          <p className="type-lede mt-5 max-w-xl text-slate">
            Most personality tests hand you a label and leave. Sonder gives you Ember: a small, old
            flame that has walked this mountain with a great many people. Ember reads your answers,
            tells you the truth kindly, and walks with you while you do something about it.
          </p>
          <GuideLine size="lg" className="mt-10 max-w-xl">
            I won&rsquo;t tell you who to be. I&rsquo;ll show you who you already are, and walk with you
            while you decide what to do about it.
          </GuideLine>
        </div>
        <ul className="space-y-8 lg:pt-3">
          {GUIDE_TRAITS.map((t) => (
            <li key={t.title} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mist text-pine">
                <t.icon size={22} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div>
                <h3 className="type-h3 text-ink">{t.title}</h3>
                <p className="mt-1 text-slate">{t.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── How it works: the trail in order ─────────────────────────────────────────

const STAGES = [
  {
    icon: Tent,
    name: "Basecamp",
    title: "Tell us where you are",
    body: "Thirteen quick questions about your life, what you're working through, and what you need from your guide.",
    meta: "3 minutes",
  },
  {
    icon: Mountain,
    name: "The climb",
    title: "Four short chapters",
    body: "56 statements drawn from established personality, career, relationship, and strengths research. Each chapter ends with a trail marker that shows what's taking shape.",
    meta: "9 minutes",
  },
  {
    icon: Sunrise,
    name: "First light",
    title: "Read three insights, free",
    body: "Your guide shares the first three things they notice before you pay anything. If they don't land, stop there.",
    meta: "Free",
  },
  {
    icon: Flag,
    name: "The summit",
    title: "Your full Sonder Report",
    body: "A nine-part letter from your guide: what they see in you, what you're carrying, how you work and love, where you get stuck, and your first 90 days. Yours to keep as a PDF.",
    meta: REPORT_PRICE_LABEL,
  },
  {
    icon: BookOpen,
    name: "The journey",
    title: "The 90-day journal",
    body: "Ninety days with your guide, printed: a short lesson, one small challenge, and an evening question for each day.",
    meta: "Coming soon",
    soon: true,
  },
];

function Trail() {
  return (
    <section id="trail" className="scroll-mt-24 bg-mist">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-32">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2 className="type-h1 text-ink">One trail, five stops.</h2>
          <p className="type-lede mt-5 max-w-md text-slate">
            Everything happens in order, at your pace. You only pay at the summit, and only if the
            free insights were worth it.
          </p>
          <Link href="/assessment" className="btn btn-dark mt-8">
            Start at basecamp
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <ol className="relative">
          <span
            aria-hidden="true"
            className="absolute bottom-10 left-[27px] top-10 w-[3px] bg-[repeating-linear-gradient(180deg,var(--color-lichen)_0_7px,transparent_7px_14px)]"
          />
          {STAGES.map((s) => (
            <li key={s.name} className="relative flex gap-6 pb-12 last:pb-0">
              <span
                className={`relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 ${
                  s.soon ? "border-dashed border-lichen bg-mist text-stone" : "border-pine bg-pine text-gold-hi"
                }`}
              >
                <s.icon size={24} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <div className="pt-1">
                <p className="type-kicker">{s.name}</p>
                <h3 className="type-h3 mt-1 text-ink">{s.title}</h3>
                <p className="mt-2 max-w-lg text-slate">{s.body}</p>
                <p
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sign text-sm font-semibold ${
                    s.soon ? "bg-mist-deep text-stone" : s.meta === REPORT_PRICE_LABEL ? "bg-gold/25 text-ink" : "bg-pine/10 text-pine"
                  }`}
                >
                  {s.meta === "Free" || s.meta === REPORT_PRICE_LABEL || s.soon ? null : <Clock size={14} aria-hidden="true" />}
                  {s.meta}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── What it measures ─────────────────────────────────────────────────────────

const MEASURES: { id: ChapterId; name: string; topic: string; framework: string; sample: string }[] = [
  { id: "terrain", name: "The terrain", topic: "Personality", framework: "Big Five (Mini-IPIP)", sample: "I have a vivid imagination." },
  { id: "path", name: "The path", topic: "Work you're drawn to", framework: "Holland codes (O*NET)", sample: "Teach someone how to do something." },
  { id: "company", name: "The company you keep", topic: "Closeness in relationships", framework: "Attachment (ECR)", sample: "I find it difficult to depend on other people." },
  { id: "carry", name: "What you carry", topic: "Character strengths", framework: "VIA strengths", sample: "I finish whatever I start." },
];

function Chapters() {
  return (
    <section className="border-t border-line/70 bg-snow">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8 lg:py-28">
        <div className="max-w-2xl">
          <h2 className="type-h1 text-ink">Built on research, written for you.</h2>
          <p className="type-lede mt-5 text-slate">
            The questions come from four well-studied frameworks. What you share at basecamp is what
            makes the writing yours.
          </p>
        </div>
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {MEASURES.map((m) => (
            <li key={m.id} className="grid gap-3 py-6 sm:grid-cols-[3.5rem_1fr_1fr] sm:items-center lg:grid-cols-[3.5rem_1.1fr_0.9fr_1.4fr] lg:gap-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mist text-pine">
                <ChapterIcon id={m.id} size={22} strokeWidth={1.9} />
              </span>
              <div>
                <h3 className="type-h3 text-ink">{m.name}</h3>
                <p className="font-sign text-[0.98rem] text-slate">{m.topic}</p>
              </div>
              <p className="font-sign text-[0.98rem] font-medium text-pine-2">{m.framework}</p>
              <p className="font-read italic text-slate sm:col-span-3 lg:col-span-1">&ldquo;{m.sample}&rdquo;</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── The journal ──────────────────────────────────────────────────────────────

function Journal() {
  return (
    <section id="journal" className="relative isolate overflow-hidden bg-pine text-snow">
      <MountainScene quiet className="absolute inset-x-0 bottom-0 -z-10 h-40 w-full opacity-[0.08]" />
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
        <div>
          <p className="type-kicker text-gold-hi">Coming soon</p>
          <h2 className="type-h1 mt-3">Ninety days, one page at a time.</h2>
          <p className="type-lede mt-5 max-w-lg text-snow/80">
            Your report shows you the pattern. The Sonder Journal helps you practice the change, with
            your guide on every page: a short lesson, one small challenge, and an evening question
            for each of the next 90 days.
          </p>
          <ol className="mt-9 space-y-5">
            {JOURNAL_PHASES.map((ph) => (
              <li key={ph.name} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-hi">
                  <ph.icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-sign text-[1.05rem] font-semibold">
                    {ph.name} <span className="font-medium text-snow/60">Days {ph.days}</span>
                  </p>
                  <p className="text-snow/75">{ph.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 max-w-lg">
            <WaitlistForm tone="dark" id="home-waitlist" />
          </div>
        </div>
        <JournalPageMock />
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Who is Ember?",
    a: "Ember is your guide: the voice of Sonder, an AI shaped to read your answers the way a wise, steady mentor would. Honest, warm, never harsh, and always pointing to a next step. Ember isn't a person and isn't a therapist.",
  },
  {
    q: "Is Sonder therapy or a diagnosis?",
    a: "No. Sonder is a tool for self-reflection. It describes patterns, not disorders, and it isn't a substitute for a licensed professional. If you're in crisis, call or text 988 (US).",
  },
  {
    q: "Where do my answers go?",
    a: "Your answers are saved in your own browser. To write your insights, they're sent to our AI provider once, without your name or email, and we don't keep a copy.",
  },
  {
    q: `Why is the full report only ${REPORT_PRICE_LABEL}?`,
    a: "It covers the cost of writing it. We'd rather more people get to read theirs.",
  },
  {
    q: "What's in the full report?",
    a: `A letter from your guide in nine parts: ${REPORT_SECTIONS.map((s) => s.title.toLowerCase()).join(", ")}. The last part includes books, journal prompts, and daily practices.`,
  },
  {
    q: "Can I take it again later?",
    a: "Yes. People change, and so do their answers. Each new full report is the same price.",
  },
];

function Faq() {
  return (
    <section className="bg-mist">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <h2 className="type-h1 text-ink">Before you start</h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 font-sign text-[1.12rem] font-semibold text-ink transition-colors hover:text-pine-2">
                {f.q}
                <ChevronDown size={20} className="shrink-0 text-stone transition-transform duration-300 group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 text-slate">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Closing ──────────────────────────────────────────────────────────────────

function Closing() {
  return (
    <section className="relative isolate overflow-hidden bg-mist">
      <MountainScene quiet className="absolute inset-x-0 bottom-0 -z-10 h-[62%] w-full" />
      <div className="mx-auto max-w-6xl px-6 pb-56 pt-20 text-center sm:px-8 sm:pb-72">
        <h2 className="type-h1 text-ink">Start where you are.</h2>
        <p className="type-lede mx-auto mt-4 max-w-md text-slate">Twelve minutes. Three free insights. No account.</p>
        <Link href="/assessment" className="btn btn-primary mt-8">
          Start the climb
          <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
