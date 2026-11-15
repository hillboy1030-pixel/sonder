// Your guide: the voice that walks with each person through Sonder.
// Shown as a lantern (the guide carries the light, the person does the walking),
// so the guide never has a face, an age, or a gender.

/**
 * A lantern icon drawn to match the line-icon set used everywhere else
 * (24×24 grid, 2px rounded strokes, no fill).
 */
export function LanternIcon({ size = 24, strokeWidth = 2, className = "" }: { size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* handle */}
      <path d="M9.5 4.5a2.5 2.5 0 0 1 5 0" />
      {/* roof */}
      <path d="M8.5 4.5h7l1.5 3H7z" />
      {/* glass */}
      <rect x="7" y="7.5" width="10" height="10" rx="2" />
      {/* flame */}
      <path d="M12 10.3c1.2 1.3 1.7 2.3 1.7 3.1a1.7 1.7 0 0 1-3.4 0c0-.8.5-1.8 1.7-3.1z" />
      {/* base */}
      <path d="M7.5 17.5 6.5 20.5h11l-1-3" />
    </svg>
  );
}

export function GuideMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-pine text-gold-hi shadow-[0_8px_20px_-10px_rgb(33_63_53/0.8)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <LanternIcon size={Math.round(size * 0.56)} strokeWidth={1.9} />
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
