"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportSection = { title: string; content: string };
type PreviewInsight = { title: string; insight: string };
type Report = { sections: ReportSection[]; previewInsights: PreviewInsight[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Reading between your answers...",
  "Finding the patterns you haven't named yet...",
  "Mapping the geometry of your inner life...",
  "Almost there...",
];

const LOCKED_SECTION_TITLES = [
  "Who You Are",
  "How You Work",
  "How You Love",
  "What Drives You",
  "Your Growth Edges",
  "Your Path Forward",
  "The Sonder Lens",
  "The Whole Picture",
];

const BLUR_PLACEHOLDER =
  "This section contains a detailed analysis of your results based on your responses across all four assessment frameworks. Unlock your full report to read the complete portrait.";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreviewPage() {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  // Rotate loading messages while waiting
  useEffect(() => {
    if (report || error) return;
    const interval = setInterval(
      () => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      2000
    );
    return () => clearInterval(interval);
  }, [report, error]);

  // Fetch report on mount — use cache if available to avoid redundant API calls
  useEffect(() => {
    // 1. Use cached report if present (e.g. user navigated back from Stripe/report)
    const cached = localStorage.getItem("sonder_report");
    if (cached) {
      try {
        setReport(JSON.parse(cached));
        return;
      } catch {
        // cache corrupt — fall through to regenerate
      }
    }

    // 2. Need scores to generate
    const raw = localStorage.getItem("sonder_scores");
    if (!raw) {
      router.replace("/assessment");
      return;
    }

    let scores: unknown;
    try {
      scores = JSON.parse(raw);
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
  }, [router]);

  if (error) return <ErrorState message={error} />;
  if (!report) return <LoadingState message={LOADING_MESSAGES[msgIndex]} />;
  return <ReportPreview report={report} />;
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6" style={{ backgroundColor: "#F9F7F4" }}>
      <span className="font-serif text-3xl font-bold text-forest mb-10">
        Sonder
      </span>

      {/* Animated dots */}
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

// ─── Error Screen ─────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6 text-center">
      <span className="font-serif text-3xl font-bold text-forest mb-6">
        Sonder
      </span>
      <p className="text-bark font-medium mb-2">Something went wrong</p>
      <p className="text-stone text-sm mb-8 max-w-sm">{message}</p>
      <a
        href="/assessment"
        className="bg-forest text-parchment px-7 py-3 rounded-sm font-medium text-sm hover:bg-forest-light transition-colors"
      >
        Back to Assessment
      </a>
    </div>
  );
}

// ─── Report Preview ───────────────────────────────────────────────────────────

function ReportPreview({ report }: { report: Report }) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  async function handleShare() {
    if (!shareCardRef.current) return;
    setShareLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 1,
        width: 1080,
        height: 1080,
        backgroundColor: "#F5F0E8",
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) { setShareLoading(false); return; }
        const file = new File([blob], "my-sonder-insights.png", { type: "image/png" });

        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "My Sonder Insights",
            text: "I just discovered something about myself. Take the assessment at sonder-me.com",
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "my-sonder-insights.png";
          a.click();
          URL.revokeObjectURL(url);
        }
        setShareLoading(false);
      }, "image/png");
    } catch (err) {
      console.error("Share failed:", err);
      setShareLoading(false);
    }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/create-checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error("Could not start checkout.");
      window.location.href = data.url;
    } catch {
      setCheckoutError("Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* Nav */}
      <header className="px-6 sm:px-10 py-5 border-b border-stone-light/30">
        <span className="font-serif text-3xl font-bold text-forest">
          Sonder
        </span>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 py-10 pb-20">
        {/* Title */}
        <div className="mb-10">
          <p className="text-xs font-medium text-forest tracking-widest uppercase mb-1">
            Your Portrait
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bark">
            Three truths about you.
          </h1>
          <p className="text-stone text-sm mt-2">
            These emerged from your answers. The full picture is below.
          </p>
        </div>

        {/* Free preview insight cards */}
        <div className="flex flex-col gap-4 mb-6">
          {(report.previewInsights ?? []).map((insight, i) => (
            <InsightCard key={i} insight={insight} index={i} />
          ))}
        </div>

        {/* Share button */}
        <div className="flex flex-col items-center gap-1.5 mb-12">
          <button
            onClick={handleShare}
            disabled={shareLoading}
            className={`w-full sm:w-auto px-8 py-3 rounded-full font-medium text-sm tracking-wide transition-colors duration-200 ${
              shareLoading
                ? "border border-stone-light text-stone cursor-not-allowed"
                : "border-forest text-forest hover:bg-forest/6 cursor-pointer"
            }`}
            style={shareLoading ? undefined : { borderWidth: "1.5px", borderStyle: "solid", borderColor: "#2D4A2E", color: "#2D4A2E" }}
          >
            {shareLoading ? "Generating image…" : "Share Your Insights"}
          </button>
          <p className="text-xs text-stone">Share your free insights — no payment needed</p>
        </div>

        {/* Locked sections */}
        <div className="mb-10">
          <p className="text-xs font-medium text-stone uppercase tracking-widest mb-4">
            Full Report — 8 Sections
          </p>
          <div className="flex flex-col gap-3">
            {LOCKED_SECTION_TITLES.map((title) => (
              <LockedSection key={title} title={title} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center text-center gap-3 pt-4">
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className={`w-full sm:w-auto inline-block font-medium text-base px-10 py-4 rounded-full tracking-wide transition-colors duration-200 text-center ${
              checkoutLoading
                ? "bg-stone-light/40 text-stone cursor-not-allowed"
                : "bg-forest text-parchment hover:bg-forest-light cursor-pointer"
            }`}
          >
            {checkoutLoading ? "Redirecting to checkout…" : "Unlock Your Full Report — $5"}
          </button>
          {checkoutError && (
            <p className="text-xs text-bark">{checkoutError}</p>
          )}
          <p className="text-xs text-stone max-w-xs leading-relaxed">
            One-time payment. Your report is yours to download. We never store
            your data.
          </p>
          <a href="/report?tester=true" className="text-xs text-stone-light hover:text-stone transition-colors">
            Skip payment (testers only)
          </a>
        </div>
      </main>

      {/* Hidden share card — rendered off-screen for html2canvas capture */}
      <div
        ref={shareCardRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "1080px",
          height: "1080px",
          backgroundColor: "#F5F0E8",
          padding: "52px 64px 44px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {/* Wordmark */}
        <div style={{ fontSize: "30px", fontWeight: "bold", color: "#3D5A3E", marginBottom: "28px", letterSpacing: "-0.5px" }}>
          Sonder
        </div>

        {/* Cards */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          {(report.previewInsights ?? []).map((insight, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: i === 1 ? "rgba(122,158,126,0.12)" : "rgba(61,90,62,0.06)",
                border: "1px solid rgba(184,178,168,0.35)",
                borderRadius: "4px",
                padding: "18px 28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: "700", color: "#3D5A3E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px", fontFamily: "system-ui, sans-serif" }}>
                {insight.title}
              </div>
              <div style={{ fontSize: "15px", color: "#2A2620", lineHeight: "1.55", fontFamily: "Georgia, serif" }}>
                {truncateToTwoSentences(insight.insight)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "22px", fontSize: "12px", color: "#8A8278", textAlign: "center", fontFamily: "system-ui, sans-serif", letterSpacing: "0.02em" }}>
          sonder-me.com — Know yourself deeply
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncateToTwoSentences(text: string): string {
  const sentences = text.split(". ");
  if (sentences.length <= 2) return text;
  const truncated = sentences.slice(0, 2).join(". ");
  return truncated.endsWith(".") ? truncated : truncated + ".";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InsightCard({
  insight,
  index,
}: {
  insight: PreviewInsight;
  index: number;
}) {
  const accents = ["bg-forest/6", "bg-sage/10", "bg-forest/6"];
  return (
    <div
      className={`${accents[index]} border border-stone-light/30 rounded px-6 py-5`}
    >
      <p className="text-xs font-semibold text-forest uppercase tracking-widest mb-2">
        {insight.title}
      </p>
      <p className="text-bark text-sm sm:text-base leading-relaxed">
        {insight.insight}
      </p>
    </div>
  );
}

function LockedSection({ title }: { title: string }) {
  return (
    <div className="relative bg-white border border-stone-light/30 rounded overflow-hidden">
      <div className="px-5 py-4">
        <p className="font-serif font-semibold text-bark mb-2">{title}</p>
        <p className="text-sm text-bark-light leading-relaxed blur-sm select-none pointer-events-none">
          {BLUR_PLACEHOLDER}
        </p>
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-parchment/40">
        <span className="text-xs font-medium text-stone bg-parchment border border-stone-light/50 px-3 py-1.5 rounded-full">
          Locked
        </span>
      </div>
    </div>
  );
}
