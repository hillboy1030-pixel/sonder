import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Flag,
  Mail,
  NotebookPen,
  PenLine,
  Printer,
  Signpost,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WaitlistForm } from "@/components/WaitlistForm";
import { JournalPageMock, JOURNAL_PHASES } from "@/components/JournalBits";

export const metadata: Metadata = {
  title: "The Sonder Journal — 90 days, one page at a time",
  description:
    "A printed 90-day journal written from your Sonder Report and what you're working through: one small challenge a day.",
};

const INSIDE = [
  { icon: Signpost, title: "A daily challenge", body: "One small, specific thing to try each day, chosen for your patterns. Five minutes, not fifty." },
  { icon: PenLine, title: "A question for the evening", body: "A short prompt about how the challenge went, with room to write." },
  { icon: CalendarCheck, title: "Weekly check-ins", body: "Every seventh day, look back at the week and notice what's shifting." },
  { icon: Flag, title: "A first and last letter", body: "On day 1 you write to who you'll be on day 90. On day 90 you write back." },
];

const STEPS = [
  { icon: NotebookPen, title: "Finish your Sonder Report", body: "The journal is written from it." },
  { icon: Mail, title: "Order your journal", body: "Add your shipping address at checkout." },
  { icon: Printer, title: "We write and print it", body: "Your 90 days, printed and bound as a single copy." },
  { icon: Truck, title: "It arrives at your door", body: "Begin on any day. Day 1 is whenever you're ready." },
];

export default function JournalPage() {
  return (
    <div className="flex min-h-svh flex-col bg-mist">
      <SiteHeader />

      <main className="flex-1">
        {/* Intro */}
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-32 sm:px-8 sm:pt-40 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="type-kicker">The Sonder Journal, coming soon</p>
            <h1 className="type-h1 mt-3 text-ink">Ninety days, one page at a time.</h1>
            <p className="type-lede mt-5 max-w-xl text-slate">
              Your report shows you the pattern. The journal is where you practice the change. It&rsquo;s
              a printed book written from your Sonder Report and the thing you&rsquo;re working through,
              with one small challenge for each of the next 90 days.
            </p>
            <div className="mt-9 max-w-lg">
              <WaitlistForm tone="light" id="journal-top" />
            </div>
          </div>
          <div className="lg:pl-6">
            <JournalPageMock />
          </div>
        </section>

        {/* Three phases */}
        <section className="bg-pine text-snow">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
            <h2 className="type-h1 max-w-2xl">A journey in three stretches.</h2>
            <p className="type-lede mt-5 max-w-xl text-snow/80">
              Change rarely happens all at once. The 90 days move from noticing, to practicing, to
              living it.
            </p>
            <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {JOURNAL_PHASES.map((ph, i) => (
                <li key={ph.name} className="relative border-t-2 border-gold/70 pt-6">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-gold-hi">
                    <ph.icon size={22} aria-hidden="true" />
                  </span>
                  <p className="mt-5 font-sign text-sm font-medium text-snow/60">
                    Stretch {i + 1}, days {ph.days}
                  </p>
                  <h3 className="type-h2 mt-1">{ph.name}</h3>
                  <p className="mt-3 text-snow/80">{ph.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Inside */}
        <section className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
          <h2 className="type-h1 max-w-2xl text-ink">What&rsquo;s on the pages</h2>
          <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {INSIDE.map((it) => (
              <li key={it.title} className="flex gap-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-snow text-pine shadow-[0_8px_20px_-14px_rgb(33_63_53/0.6)]">
                  <it.icon size={22} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="type-h3 text-ink">{it.title}</h3>
                  <p className="mt-1.5 text-slate">{it.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* How ordering will work */}
        <section className="border-y border-line bg-snow">
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
            <h2 className="type-h1 text-ink">How it will work</h2>
            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-pine text-gold-hi">
                      <s.icon size={20} aria-hidden="true" />
                    </span>
                    <span className="font-sign text-sm font-semibold text-stone">Step {i + 1}</span>
                  </div>
                  <h3 className="type-h3 mt-4 text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-slate">{s.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-12 max-w-2xl text-slate">
              To make your journal we&rsquo;ll need your report and a shipping address. We use them only
              to write, print, and ship your copy.
            </p>
          </div>
        </section>

        {/* Waitlist */}
        <section className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-8">
          <h2 className="type-h1 text-ink">Be first on the trail.</h2>
          <p className="type-lede mx-auto mt-4 max-w-lg text-slate">
            We&rsquo;re finishing the first edition now. Join the list and you&rsquo;ll hear the
            moment it&rsquo;s ready, along with the price.
          </p>
          <div className="mx-auto mt-8 max-w-lg text-left">
            <WaitlistForm tone="light" id="journal-bottom" />
          </div>
          <p className="mt-10 font-sign text-[0.98rem] text-slate">
            Haven&rsquo;t taken the assessment yet?{" "}
            <Link href="/assessment" className="inline-flex items-center gap-1 font-semibold text-pine underline-offset-4 hover:underline">
              Start the climb
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
