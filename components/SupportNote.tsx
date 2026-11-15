import { HeartHandshake, MessageCircle, Phone } from "lucide-react";

/** Crisis resources, shown when someone's words suggest they may be struggling. */
export function SupportNote({ onContinue, compact = false }: { onContinue?: () => void; compact?: boolean }) {
  return (
    <div role="note" className="rounded-panel border border-ember/30 bg-[#F8EEE9] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ember/12 text-ember">
          <HeartHandshake size={22} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="font-sign text-[1.15rem] font-semibold text-ink">
            {compact ? "You don't have to carry this alone" : "It sounds like you're carrying something heavy"}
          </h2>
          <p className="mt-1.5 font-read text-[1.02rem] leading-relaxed text-slate">
            Sonder is a reflection tool, not a crisis service. If you&rsquo;re thinking about hurting
            yourself, or you&rsquo;re not safe, please reach out now. Real people are there 24/7.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a href="tel:988" className="btn btn-dark btn-sm">
              <Phone size={16} aria-hidden="true" />
              Call 988
            </a>
            <a href="sms:988" className="btn btn-secondary btn-sm">
              <MessageCircle size={16} aria-hidden="true" />
              Text 988
            </a>
          </div>
          <p className="mt-3 font-sign text-sm text-slate">
            988 Suicide &amp; Crisis Lifeline (US). In immediate danger, call 911. Outside the US,{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noreferrer" className="font-semibold text-pine underline underline-offset-2">
              find a helpline
            </a>
            .
          </p>
          {onContinue && (
            <button onClick={onContinue} className="btn btn-quiet btn-sm mt-3 -ml-1">
              I&rsquo;m okay, continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
