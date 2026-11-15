import { Footprints, Home, Mountain } from "lucide-react";

export const JOURNAL_PHASES = [
  { name: "Ground", days: "1–30", icon: Footprints, body: "Notice your patterns as they happen, one small observation a day." },
  { name: "Climb", days: "31–60", icon: Mountain, body: "Practice the harder choice in low-stakes moments, until it feels familiar." },
  { name: "Return", days: "61–90", icon: Home, body: "Bring it home: make the change part of how you live, not a project." },
];

/** A sample journal page, styled like the printed book. */
export function JournalPageMock({ className = "" }: { className?: string }) {
  return (
    <figure className={`relative mx-auto w-full max-w-md ${className}`}>
      <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rotate-[2.5deg] rounded-[6px] bg-[#E6E0D3] shadow-xl" />
      <div className="relative -rotate-[1.5deg] rounded-[6px] bg-[#F4F0E7] px-8 pb-9 pt-8 text-ink shadow-[0_30px_60px_-20px_rgb(0_0_0/0.55)] sm:px-10">
        <div className="flex items-baseline justify-between border-b border-[#D9D2C3] pb-3">
          <p className="font-sign text-sm font-semibold text-pine-2">Climb</p>
          <p className="font-sign text-sm text-stone">Day 23 of 90</p>
        </div>
        <p className="mt-6 font-sign text-[0.82rem] font-semibold text-ember">Today&rsquo;s challenge</p>
        <p className="mt-1.5 font-read text-[1.15rem] leading-snug">
          Before you agree to anything today, say &ldquo;let me check&rdquo; and wait an hour.
        </p>
        <p className="mt-6 font-sign text-[0.82rem] font-semibold text-ember">Tonight, write</p>
        <p className="mt-1.5 font-read italic leading-snug text-slate">
          What did the pause tell you about the yes you almost gave?
        </p>
        <div aria-hidden="true" className="mt-5 space-y-[1.6rem]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-px bg-[#D9D2C3]" />
          ))}
        </div>
        <p className="mt-7 text-center font-sign text-xs text-stone">Written for you, from your Sonder Report</p>
      </div>
      <figcaption className="sr-only">A sample page from the Sonder Journal</figcaption>
    </figure>
  );
}
