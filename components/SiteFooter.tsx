import Link from "next/link";
import { LogoMark } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="no-print relative mt-auto overflow-hidden bg-pine text-snow/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5 text-snow">
            <LogoMark className="h-7 w-7" />
            <span className="font-sign text-xl font-bold">Sonder</span>
          </div>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-snow/70">
            Built on the IPIP-NEO, ECR-RS, O*NET and VIA research frameworks. A tool for
            reflection, not a diagnosis or a substitute for professional care.
          </p>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-snow/70">
            In crisis? Call or text <a className="font-semibold text-gold-hi underline-offset-4 hover:underline" href="tel:988">988</a> any time (US).
          </p>
        </div>
        <FooterCol
          title="Sonder"
          links={[
            ["/assessment", "Start the climb"],
            ["/journal", "The 90-day journal"],
            ["/about", "About"],
          ]}
        />
        <FooterCol
          title="The fine print"
          links={[
            ["/privacy", "Privacy"],
            ["/terms", "Terms"],
            ["mailto:hello@sonder-me.com", "hello@sonder-me.com"],
          ]}
        />
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-5 font-sign text-sm text-snow/50 sm:px-8">
          © {new Date().getFullYear()} Sonder. Your answers stay in your browser.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="font-sign text-base font-semibold text-snow">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="font-sign text-[0.95rem] text-snow/70 transition-colors hover:text-gold-hi">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
