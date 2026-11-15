// Your guide: the voice that walks with each person through Sonder.
// Shown as a lantern (the guide carries the light, the person does the walking)
// so the guide never has a face, an age, or a gender. Anyone can picture their own.

export function GuideMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full bg-pine shadow-[0_6px_18px_-8px_rgb(33_63_53/0.8)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgb(251_227_174/0.55),transparent_70%)]" />
      <svg viewBox="0 0 32 32" width={size * 0.6} height={size * 0.6} className="relative">
        {/* handle */}
        <path d="M12.5 7.2a3.5 3.5 0 0 1 7 0" fill="none" stroke="#C9D3CE" strokeWidth="1.6" strokeLinecap="round" />
        {/* cap */}
        <path d="M10.5 9.5h11l-1.6 2.6h-7.8z" fill="#C9D3CE" />
        {/* glass */}
        <rect x="11.2" y="12.1" width="9.6" height="11" rx="2.4" fill="#F4C46F" />
        <rect x="11.2" y="12.1" width="9.6" height="11" rx="2.4" fill="none" stroke="#C9D3CE" strokeWidth="1.2" />
        {/* flame */}
        <path d="M16 14.6c1.6 1.7 2.1 3 2.1 4a2.1 2.1 0 0 1-4.2 0c0-1 .5-2.3 2.1-4z" fill="#FFF3D6" />
        {/* base */}
        <rect x="10" y="23.1" width="12" height="2.4" rx="1" fill="#C9D3CE" />
      </svg>
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
      <GuideMark size={size === "lg" ? 52 : size === "sm" ? 36 : 44} />
      <div className="min-w-0 pt-0.5">
        {label && (
          <figcaption className={`font-sign text-sm font-semibold ${tone === "dark" ? "text-gold-hi" : "text-pine-2"}`}>{label}</figcaption>
        )}
        <blockquote className={`mt-0.5 font-read italic ${text} ${tone === "dark" ? "text-snow/90" : "text-ink"}`}>{children}</blockquote>
      </div>
    </figure>
  );
}
