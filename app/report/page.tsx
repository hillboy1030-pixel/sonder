"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportSection = { title: string; content: string };
type Report = { sections: ReportSection[]; previewInsights: unknown[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Reading between your answers...",
  "Finding the patterns you haven't named yet...",
  "Mapping the geometry of your inner life...",
  "Almost there...",
];

const TODAY = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading..." />}>
      <ReportPageInner />
    </Suspense>
  );
}

function ReportPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  // Rotate loading messages while waiting
  useEffect(() => {
    if (report || error || paymentError) return;
    const interval = setInterval(
      () => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      2000
    );
    return () => clearInterval(interval);
  }, [report, error, paymentError]);

  // Verify payment then load or regenerate report
  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    const isTester = searchParams.get("tester") === "true";

    async function load() {
      // TESTER BYPASS — remove before public launch
      if (isTester) {
        console.log("TESTER MODE — remove before public launch");
        const cached = localStorage.getItem("sonder_report");
        if (!cached) {
          router.replace("/preview");
          return;
        }
        // Fall through to load from cache below
      }
      // 1. If session_id present, verify payment with Stripe
      else if (sessionId) {
        const res = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const { verified } = await res.json();
        if (!verified) {
          setPaymentError(true);
          return;
        }
      } else {
        // No session_id — only allow if a cached report exists (dev / direct nav)
        const cached = localStorage.getItem("sonder_report");
        if (!cached) {
          router.replace("/preview");
          return;
        }
      }

      // 2. Try cached report first
      const cached = localStorage.getItem("sonder_report");
      if (cached) {
        try {
          setReport(JSON.parse(cached));
          return;
        } catch {
          // fall through to regenerate
        }
      }

      // 3. Regenerate from scores
      const rawScores = localStorage.getItem("sonder_scores");
      if (!rawScores) {
        router.replace("/assessment");
        return;
      }

      let scores: unknown;
      try {
        scores = JSON.parse(rawScores);
      } catch {
        router.replace("/assessment");
        return;
      }

      let context: unknown;
      try {
        const rawContext = localStorage.getItem("sonder_context");
        if (rawContext) context = JSON.parse(rawContext);
      } catch {
        // context is optional — proceed without it
      }

      fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, context }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Report generation failed. Please try again.");
          return res.json();
        })
        .then((data: Report) => {
          localStorage.setItem("sonder_report", JSON.stringify(data));
          setReport(data);
        })
        .catch((err: Error) => setError(err.message));
    }

    load();
  }, [router, searchParams]);

  if (paymentError) return <PaymentErrorState />;
  if (error) return <ErrorState message={error} />;
  if (!report) return <LoadingState message={LOADING_MESSAGES[msgIndex]} />;
  return <FullReport report={report} />;
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6">
      <span className="font-serif text-3xl font-bold text-forest mb-10">
        Sonder
      </span>
      <div className="flex gap-2 mb-8">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-forest/60 inline-block animate-pulse"
            style={{ animationDelay: `${i * 250}ms` }}
          />
        ))}
      </div>
      <p
        key={message}
        className="text-stone text-center text-sm sm:text-base max-w-xs leading-relaxed animate-fade-up"
      >
        {message}
      </p>
      <p className="mt-10 text-xs text-stone-light text-center max-w-xs">
        We&rsquo;re reading your responses carefully. This usually takes 15–30 seconds.
      </p>
    </div>
  );
}

// ─── Error Screens ────────────────────────────────────────────────────────────

function PaymentErrorState() {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6 text-center">
      <span className="font-serif text-3xl font-bold text-forest mb-6">Sonder</span>
      <p className="text-bark font-medium mb-2">Payment could not be verified</p>
      <p className="text-stone text-sm mb-8 max-w-sm">
        We weren&rsquo;t able to confirm your payment. If you believe this is an error,
        please contact support.
      </p>
      <a
        href="/preview"
        className="bg-forest text-parchment px-7 py-3 rounded-full font-medium text-sm hover:bg-forest-light transition-colors"
      >
        Back to Preview
      </a>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6 text-center">
      <span className="font-serif text-3xl font-bold text-forest mb-6">Sonder</span>
      <p className="text-bark font-medium mb-2">Something went wrong</p>
      <p className="text-stone text-sm mb-8 max-w-sm">{message}</p>
      <a
        href="/assessment"
        className="bg-forest text-parchment px-7 py-3 rounded-full font-medium text-sm hover:bg-forest-light transition-colors"
      >
        Back to Assessment
      </a>
    </div>
  );
}

// ─── Download Button ──────────────────────────────────────────────────────────

function DownloadButton({
  printing,
  onPrint,
}: {
  printing: boolean;
  onPrint: () => void;
}) {
  return (
    <div className="no-print flex flex-col items-center gap-2">
      <button
        className="bg-forest text-parchment text-sm font-medium px-8 py-3 rounded-full hover:bg-forest-light transition-colors duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onPrint}
        disabled={printing}
      >
        {printing ? "Opening print dialog…" : "Download PDF"}
      </button>
      {printing && (
        <p className="text-xs text-stone text-center max-w-xs leading-relaxed">
          In the print dialog: set <strong className="text-bark">Destination</strong> to{" "}
          <strong className="text-bark">Save as PDF</strong>, then uncheck{" "}
          <strong className="text-bark">Headers and footers</strong> for the best result.
        </p>
      )}
    </div>
  );
}

// ─── Full Report ──────────────────────────────────────────────────────────────

function FullReport({ report }: { report: Report }) {
  const [printing, setPrinting] = useState(false);

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      const reset = () => {
        setPrinting(false);
        window.removeEventListener("afterprint", reset);
      };
      window.addEventListener("afterprint", reset);
      window.print();
    }, 800);
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Nav — hidden in print */}
      <header className="no-print px-6 sm:px-10 py-5 border-b border-stone-light/30">
        <span className="font-serif text-3xl font-bold text-forest">Sonder</span>
      </header>

      <main className="print-main flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 pt-14 pb-28">

        {/* Report header */}
        <div className="text-center mb-12">
          {/* Label — hidden in print */}
          <p className="no-print text-xs font-medium text-forest tracking-widest uppercase mb-3">
            Full Report
          </p>

          <h1
            className="print-report-title font-serif text-4xl sm:text-5xl font-bold text-bark mb-3"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Your Sonder Report
          </h1>
          <p className="print-report-date text-stone text-sm mb-6">{TODAY}</p>

          {/* Privacy notice — hidden in print */}
          <p className="no-print text-xs text-stone italic max-w-md mx-auto leading-relaxed mb-8">
            Save or print this report now — for your privacy, we do not store your data
            and this page will not be accessible after you close your browser.
          </p>

          <DownloadButton printing={printing} onPrint={handlePrint} />
        </div>

        {/* Sections */}
        <div>
          {report.sections.map((section, i) => (
            <div key={i}>
              <Section section={section} index={i} />
              {i < report.sections.length - 1 && (
                <div className="print-divider h-px bg-stone-light/30 my-12" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom download button — hidden in print */}
        <div className="mt-16 flex justify-center">
          <DownloadButton printing={printing} onPrint={handlePrint} />
        </div>
      </main>
    </div>
  );
}

// ─── Inline bold renderer — converts **text** to <strong> ────────────────────

function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold text-bark">{part.slice(2, -2)}</strong>
      : part
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ section, index }: { section: ReportSection; index: number }) {
  return (
    <>
      {/* Zero-height break trigger — sits outside the content wrapper so
          page-break-inside: avoid on the content doesn't suppress it */}
      {index > 0 && <div className="print-section-break" aria-hidden="true" />}
      <div className="print-section-content pt-2">
        <p
          className="print-section-number font-serif font-bold text-bark/20 leading-none mb-2"
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "clamp(36px, 4vw, 52px)",
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </p>
        <h2
          className="print-section-title font-serif text-xl sm:text-2xl font-bold text-bark mb-5"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          {section.title}
        </h2>
        <div className="flex flex-col gap-4">
          {section.content.split(/\n+/).filter(Boolean).map((para, i) => (
            <p key={i} className="print-para text-bark-light leading-relaxed text-base sm:text-[1.0625rem]">
              {renderInlineBold(para)}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
