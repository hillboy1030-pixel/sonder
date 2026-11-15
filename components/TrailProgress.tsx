import { Check, Flag } from "lucide-react";
import { CHAPTERS } from "@/lib/chapters";
import { ChapterIcon } from "./ChapterIcon";

/**
 * The climb as a trail: five waypoints (basecamp + four chapters) and the summit.
 * `chapter` is the current chapter index; `fraction` is progress through it (0–1).
 */
export function TrailProgress({ chapter, fraction }: { chapter: number; fraction: number }) {
  const segments = CHAPTERS.length; // waypoints sit at the start of each segment; summit at the end
  const overall = Math.min(1, (chapter + Math.max(0, Math.min(1, fraction))) / segments);

  return (
    <div className="w-full" role="progressbar" aria-label="Your progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(overall * 100)}>
      <div className="relative mx-4 h-11">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[repeating-linear-gradient(90deg,var(--color-line)_0_6px,transparent_6px_11px)]" />
        <div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gold transition-[width] duration-500 ease-out"
          style={{ width: `${overall * 100}%` }}
        />
        {/* Hiker */}
        <div
          className="absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-snow bg-gold shadow-[0_0_0_4px_rgb(226_162_59/0.25)] transition-[left] duration-500 ease-out"
          style={{ left: `${overall * 100}%` }}
        />
        {CHAPTERS.map((c, i) => {
          const done = i < chapter;
          const current = i === chapter;
          return (
            <div
              key={c.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(i / segments) * 100}%` }}
              title={c.name}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-full border transition-colors duration-300 ${
                  done
                    ? "border-pine bg-pine text-snow"
                    : current
                    ? "border-gold bg-snow text-pine shadow-[0_0_0_4px_rgb(226_162_59/0.22)]"
                    : "border-line bg-snow text-stone"
                }`}
              >
                {done ? <Check size={16} strokeWidth={2.75} aria-hidden="true" /> : <ChapterIcon id={c.id} size={17} strokeWidth={2} />}
              </span>
            </div>
          );
        })}
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2" title="Summit">
          <span className={`grid h-9 w-9 place-items-center rounded-full border ${overall >= 1 ? "border-gold bg-gold text-ink" : "border-line bg-snow text-stone"}`}>
            <Flag size={16} strokeWidth={2.25} aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}
