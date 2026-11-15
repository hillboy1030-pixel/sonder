// Your guide: the voice that walks with each person through Sonder.
// Shown as a trail lantern (the guide carries the light, the person does the
// walking), so the guide never has a face, an age, or a gender.

/** The lantern drawing on its own. Designed on a 64×64 grid. */
export function Lantern({ size = 32, glow = true }: { size?: number; glow?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="lantern-glass" cx="50%" cy="58%" r="60%">
          <stop offset="0%" stopColor="#FFF4D2" />
          <stop offset="45%" stopColor="#F7C76A" />
          <stop offset="100%" stopColor="#D98E2B" />
        </radialGradient>
        <radialGradient id="lantern-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FBD98E" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FBD98E" stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <circle cx="32" cy="37" r="26" fill="url(#lantern-halo)" />}

      {/* Wire bail (carrying handle) */}
      <path d="M21 17 C21 5, 43 5, 43 17" fill="none" stroke="#DCE4DF" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="7.2" r="2.4" fill="none" stroke="#DCE4DF" strokeWidth="2" />

      {/* Roof with vent */}
      <rect x="28" y="11" width="8" height="4" rx="1" fill="#DCE4DF" />
      <path d="M18 22 L24 14.5 H40 L46 22 Z" fill="#DCE4DF" />
      <rect x="16.5" y="21" width="31" height="3.4" rx="1.4" fill="#C3CEC8" />

      {/* Glass globe */}
      <path d="M20.5 24.4 H43.5 C46.5 30, 46.5 41, 43.5 46.6 H20.5 C17.5 41, 17.5 30, 20.5 24.4 Z" fill="url(#lantern-glass)" />
      {/* Guard wires */}
      <path d="M26.5 24.4 C25 31, 25 40, 26.5 46.6 M37.5 24.4 C39 31, 39 40, 37.5 46.6" fill="none" stroke="#DCE4DF" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M19 35.5 H45" stroke="#DCE4DF" strokeWidth="1.6" />
      {/* Flame */}
      <path d="M32 27.5 C35.6 31.4, 36.4 34.2, 36.4 36.4 A4.4 4.4 0 0 1 27.6 36.4 C27.6 34.2, 28.4 31.4, 32 27.5 Z" fill="#FFFBEF" />
      <path d="M32 32.5 C33.4 34, 33.8 35.1, 33.8 36 A1.8 1.8 0 0 1 30.2 36 C30.2 35.1, 30.6 34, 32 32.5 Z" fill="#F2A93B" />
      {/* Base / fuel tank */}
      <rect x="16.5" y="46.2" width="31" height="3.4" rx="1.4" fill="#C3CEC8" />
      <path d="M19 49.6 H45 L43 56 C42.6 57.2, 41.6 58, 40.4 58 H23.6 C22.4 58, 21.4 57.2, 21 56 Z" fill="#DCE4DF" />
    </svg>
  );
}

export function GuideMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_60%,#2E5546,#213F35_70%)] shadow-[0_8px_20px_-8px_rgb(33_63_53/0.85)] ring-1 ring-white/10 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Lantern size={Math.round(size * 0.8)} />
    </span>
  );
}

/**
 * A line spoken by the guide. `tone` matches the surface it sits on.
 */
export function GuideLine({
  children,
  tone = "light",
  size = "md",
  label = "Your guide",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  label?: string | null;
  className?: string;
}) {
  const text =
    size === "lg" ? "text-[1.3rem] sm:text-[1.45rem] leading-[1.5]" : size === "sm" ? "text-[1rem] leading-relaxed" : "text-[1.12rem] leading-[1.6]";
  return (
    <figure className={`flex items-start gap-3.5 ${className}`}>
      <GuideMark size={size === "lg" ? 56 : size === "sm" ? 40 : 48} />
      <div className="min-w-0 pt-0.5">
        {label && (
          <figcaption className={`font-sign text-sm font-semibold ${tone === "dark" ? "text-gold-hi" : "text-pine-2"}`}>{label}</figcaption>
        )}
        <blockquote className={`mt-0.5 font-read italic ${text} ${tone === "dark" ? "text-snow/90" : "text-ink"}`}>{children}</blockquote>
      </div>
    </figure>
  );
}
