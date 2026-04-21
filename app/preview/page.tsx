"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type PreviewInsight = { title: string; insight: string };
type PreviewData = { previewInsights: PreviewInsight[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Settling into the quiet...",
  "Reading the geometry of your answers...",
  "Finding the first three truths...",
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
  "Your Next 90 Days",
];

const BLUR_PLACEHOLDER =
  "This section contains a detailed analysis of your results based on your responses across all four assessment frameworks. Unlock your full report to read the complete portrait.";

// ─── Page ─────────────────────────────────────────────────────────────────────

// Parallel background generation removed — re-enable when upgraded to Vercel Pro (maxDuration 300 already set on the report route)

export default function PreviewPage() {
  const router = useRouter();
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  // Incrementing triggers a re-fetch of the preview
  const [retryCount, setRetryCount] = useState(0);
  // Prevents a second concurrent preview fetch if router ref changes and re-runs the effect
  const previewFetchStarted = useRef(false);

  // Rotate loading messages while waiting for preview
  useEffect(() => {
    if (preview || error) return;
    const interval = setInterval(
      () => setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1)),
      7000
    );
    return () => clearInterval(interval);
  }, [preview, error]);

  // Fetch preview — runs on mount and on retry
  useEffect(() => {
    // On retry: reset the guard so a fresh fetch is allowed
    if (retryCount > 0) previewFetchStarted.current = false;

    // Guard: prevent a second concurrent fetch if router ref changes and re-runs this effect
    if (previewFetchStarted.current) return;
    previewFetchStarted.current = true;

    // Always parse scores first — needed both for cache-hit path and fresh fetch
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
      // context is optional
    }

    // On first load: use cached preview if available
    if (retryCount === 0) {
      const cached = localStorage.getItem("sonder_preview");
      if (cached) {
        try {
          setPreview(JSON.parse(cached));
          return;
        } catch {
          // cache corrupt — fall through to regenerate
        }
      }
    }

    // Fetch the 3 preview cards from the fast endpoint
    fetch("/api/generate-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores, context }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({ error: undefined }));
        if (!res.ok) {
          throw new Error(data?.error ?? "Preview generation failed. Please try again.");
        }
        return data as PreviewData;
      })
      .then((data) => {
        localStorage.setItem("sonder_preview", JSON.stringify(data));
        setPreview(data);
      })
      .catch((err: Error) => {
        // Reset guard so the user can retry
        previewFetchStarted.current = false;
        const msg = err?.message ?? "";
        if (!msg || msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
          setError("We couldn't reach our server. Check your connection and try again.");
        } else {
          setError(msg);
        }
      });
  }, [retryCount, router]);

  function handleRetry() {
    setError(null);
    setPreview(null);
    previewFetchStarted.current = false; // allow preview fetch to restart on retry
    setRetryCount((c) => c + 1);
  }

  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!preview) return <LoadingState message={LOADING_MESSAGES[msgIndex]} />;
  return <ReportPreview previewInsights={preview.previewInsights} />;
}

// ─── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ duration }: { duration: number }) {
  const C = 150.8; // circumference of r=24 circle (2π×24)
  const [offset, setOffset] = useState(C);

  useEffect(() => {
    const startTime = Date.now();
    const totalMs = duration * 1000;
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalMs, 1);
      setOffset(C * (1 - progress));
      if (progress >= 1) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, [duration]);

  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
      {/* Ghost track */}
      <circle cx="30" cy="30" r="24" stroke="#3D5A3E" strokeWidth="2" strokeOpacity="0.12" />
      {/* Filling arc — starts at 12 o'clock */}
      <circle
        cx="30" cy="30" r="24"
        stroke="#3D5A3E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        transform="rotate(-90 30 30)"
      />
    </svg>
  );
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6">
      <span className="font-serif text-3xl font-bold text-forest mb-14">
        Sonder
      </span>

      {/* Circular progress ring — fills over 30 seconds */}
      <ProgressRing duration={30} />

      {/* Sequential message — key swap triggers fade-up re-animation */}
      <p
        key={message}
        className="mt-10 text-center max-w-xs animate-fade-up"
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: "italic",
          fontSize: "1.125rem",
          lineHeight: "1.65",
          color: "#3D5A3E",
        }}
      >
        {message}
      </p>

      <p className="mt-8 text-xs text-stone-light text-center">
        Patterns surface slowly. This is by design.
      </p>
    </div>
  );
}

// ─── Error Screen ─────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6 text-center">
      <span className="font-serif text-3xl font-bold text-forest mb-6">
        Sonder
      </span>
      <p className="text-bark font-medium mb-2">Something went wrong</p>
      <p className="text-stone text-sm mb-8 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="bg-forest text-parchment px-7 py-3 rounded-sm font-medium text-sm hover:bg-forest-light transition-colors mb-4"
      >
        Try Again
      </button>
      <a
        href="/assessment"
        className="text-stone text-sm underline underline-offset-2 hover:text-bark transition-colors"
      >
        Back to Assessment
      </a>
    </div>
  );
}

// ─── Report Preview ───────────────────────────────────────────────────────────

function ReportPreview({ previewInsights }: { previewInsights: PreviewInsight[] }) {
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
            Your First Sonder
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bark">
            Three truths from your sonder.
          </h1>
          <p className="text-stone text-sm mt-2">
            These emerged from your answers. The full picture is below.
          </p>
        </div>

        {/* Free preview insight cards */}
        <div className="flex flex-col gap-4 mb-6">
          {previewInsights.map((insight, i) => (
            <InsightCard key={i} insight={insight} index={i} />
          ))}
        </div>

        {/* CTA — top (above share) */}
        <div className="mb-10">
          <CheckoutButtons
            checkoutLoading={checkoutLoading}
            checkoutError={checkoutError}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Locked sections */}
        <div className="mb-10">
          <p className="text-xs font-medium text-stone uppercase tracking-widest mb-4">
            Full Report — 9 Sections
          </p>
          <div className="flex flex-col gap-3">
            {LOCKED_SECTION_TITLES.map((title) => (
              <LockedSection key={title} title={title} />
            ))}
          </div>
        </div>

        {/* CTA — bottom */}
        <CheckoutButtons
          checkoutLoading={checkoutLoading}
          checkoutError={checkoutError}
          onCheckout={handleCheckout}
        />
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
          {previewInsights.map((insight, i) => (
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

function CheckoutButtons({
  checkoutLoading,
  checkoutError,
  onCheckout,
}: {
  checkoutLoading: boolean;
  checkoutError: string | null;
  onCheckout: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 pt-4">
      <button
        onClick={onCheckout}
        disabled={checkoutLoading}
        className={`w-full sm:w-auto inline-block font-medium text-base px-10 py-4 rounded-full tracking-wide transition-colors duration-200 text-center ${
          checkoutLoading
            ? "bg-stone-light/40 text-stone cursor-not-allowed"
            : "bg-forest text-parchment hover:bg-forest-light cursor-pointer"
        }`}
      >
        {checkoutLoading ? "Redirecting to checkout…" : "Sonder Deeper — $5"}
      </button>
      {checkoutError && (
        <p className="text-xs text-bark">{checkoutError}</p>
      )}
      <p
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: "italic",
          fontSize: "13px",
          color: "#B8B2A8",
          lineHeight: 1.6,
        }}
      >
        Your full report takes two to three minutes to write. We don&rsquo;t rush this part.
      </p>
      <p className="text-xs text-stone max-w-xs leading-relaxed">
        One-time payment. Your report is yours to download. We never store
        your data.
      </p>
      <a
        href="/report?tester=true"
        className="w-full sm:w-auto inline-block font-medium text-base px-10 py-4 rounded-full tracking-wide transition-colors duration-200 text-center bg-forest text-parchment hover:bg-forest-light"
      >
        View Full Report (Testers Only)
      </a>
    </div>
  );
}

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
