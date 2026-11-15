import Link from "next/link";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="21.5" cy="11" r="4" fill="#E2A23B" />
      <path d="M2 27 L12 11 L17 18 L20.5 14 L30 27 Z" fill="currentColor" />
      <path d="M12 11 L14.6 15.2 L12.6 14.2 L10.6 15.6 Z" fill="#F6F8F7" opacity="0.85" />
    </svg>
  );
}

export function Logo({ tone = "dark", href = "/" }: { tone?: "dark" | "light"; href?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 rounded-lg ${tone === "light" ? "text-snow" : "text-pine"}`}
      aria-label="Sonder home"
    >
      <LogoMark className="h-7 w-7 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span className="font-sign text-[1.45rem] font-bold tracking-tight">Sonder</span>
    </Link>
  );
}
