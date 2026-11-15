import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Shared layout for About, Privacy, and Terms. */
export function ProsePage({
  kicker,
  title,
  updated,
  children,
}: {
  kicker?: string;
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-mist">
      <SiteHeader />
      <main className="flex-1 px-6 pb-24 pt-32 sm:px-8 sm:pt-40">
        <article className="mx-auto max-w-[42rem]">
          {kicker && <p className="type-kicker">{kicker}</p>}
          <h1 className="type-h1 mt-3 text-ink">{title}</h1>
          {updated && <p className="mt-3 font-sign text-sm text-stone">Last updated {updated}</p>}
          <div className="prose-page mt-10 text-[1.08rem] leading-[1.8] text-slate">{children}</div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

export function ProseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="type-h3 mb-3 text-ink">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
