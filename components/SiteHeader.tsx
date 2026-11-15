"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#trail", label: "How it works" },
  { href: "/journal", label: "The journal" },
  { href: "/about", label: "About" },
];

/**
 * Site navigation. "overlay" floats over the hero and frosts once you scroll;
 * "solid" is for inner pages.
 */
export function SiteHeader({ variant = "solid", cta = true }: { variant?: "overlay" | "solid"; cta?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== "overlay") return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const onDark = variant === "overlay" && !scrolled;

  return (
    <header className="no-print fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Main"
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[18px] py-2.5 pl-4 pr-2.5 transition-all duration-300 sm:pl-5 ${
          onDark ? "glass-dark" : "glass"
        }`}
      >
        <Logo tone={onDark ? "light" : "dark"} />
        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`rounded-xl px-3.5 py-2 text-[0.95rem] font-medium transition-colors ${
                    onDark ? "text-snow/85 hover:bg-white/15 hover:text-snow" : "text-slate hover:bg-pine/8 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/journal"
            className={`rounded-xl px-3 py-2 text-[0.95rem] font-medium md:hidden ${onDark ? "text-snow/85" : "text-slate"}`}
          >
            Journal
          </Link>
          {cta && (
            <Link href="/assessment" className="btn btn-primary btn-sm">
              Start free
              <ArrowRight size={17} strokeWidth={2.25} aria-hidden="true" />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
