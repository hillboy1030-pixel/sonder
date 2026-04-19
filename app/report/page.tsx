"use client";

export const dynamic = "force-dynamic";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type PreviewInsight = { title: string; insight: string };
type ReportSection = { title: string; content: string };
type Report = { sections: ReportSection[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Settling into the quiet...",
  "Reading the geometry of your answers...",
  "Finding the patterns you haven't named yet...",
  "Mapping how you work and how you love...",
  "Translating your inner world...",
  "Writing the truths others haven't told you...",
  "Shaping your next 90 days...",
  "Almost there. This is worth waiting for.",
];

const TODAY = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingState message={LOADING_MESSAGES[0]} />}>
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
  // Incrementing triggers a fresh report regeneration without re-verifying payment
  const [retryCount, setRetryCount] = useState(0);

  // Rotate loading messages while waiting
  useEffect(() => {
    if (report || error || paymentError) return;
    const interval = setInterval(
      () => setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1)),
      11000
    );
    return () => clearInterval(interval);
  }, [report, error, paymentError]);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const isTester = searchParams.get("tester") === "true";

    async function load() {
      // Payment verification only on initial load — retries skip this
      if (retryCount === 0) {
        if (isTester) {
          // TESTER BYPASS — remove before public launch
          console.log("TESTER MODE — remove before public launch");
          // Fall through to load/regenerate below
        } else if (sessionId) {
          // Verify payment with Stripe
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
      }

      // Use cached report if present and background generation didn't fail
      const failed = localStorage.getItem("sonder_report_failed") === "true";
      const cachedJson = localStorage.getItem("sonder_report");
      if (cachedJson && !failed) {
        try {
          setReport(JSON.parse(cachedJson));
          return;
        } catch {
          // cache corrupt — fall through to regenerate
        }
      }

      // Clear failed flag and regenerate fresh
      localStorage.removeItem("sonder_report_failed");

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

      fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, context }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({ error: undefined }));
          if (!res.ok) {
            throw new Error(data?.error ?? "Report generation failed. Please try again.");
          }
          return data as Report;
        })
        .then((data) => {
          localStorage.setItem("sonder_report", JSON.stringify(data));
          setReport(data);
        })
        .catch((err: Error) => {
          const msg = err?.message ?? "";
          if (!msg || msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
            setError("We couldn't reach our server. Check your connection and try again.");
          } else {
            setError(msg);
          }
        });
    }

    load();
  }, [retryCount, router, searchParams]);

  function handleRetry() {
    setError(null);
    setReport(null);
    setRetryCount((c) => c + 1);
  }

  if (paymentError) return <PaymentErrorState />;
  if (error) return <ErrorState message={error} onRetry={handleRetry} />;
  if (!report) return <LoadingState message={LOADING_MESSAGES[msgIndex]} />;
  return <FullReport report={report} />;
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

      {/* Circular progress ring — fills over 120 seconds */}
      <ProgressRing duration={120} />

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
        Sixty to ninety seconds. Some things cannot be rushed.
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

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6 text-center">
      <span className="font-serif text-3xl font-bold text-forest mb-6">Sonder</span>
      <p className="text-bark font-medium mb-2">Something went wrong</p>
      <p className="text-stone text-sm mb-8 max-w-sm">{message}</p>
      <button
        onClick={onRetry}
        className="bg-forest text-parchment px-7 py-3 rounded-full font-medium text-sm hover:bg-forest-light transition-colors mb-4"
      >
        Try Again
      </button>
      <a
        href="/preview"
        className="text-stone text-sm underline underline-offset-2 hover:text-bark transition-colors"
      >
        Back to Preview
      </a>
    </div>
  );
}

// ─── PDF Generation ───────────────────────────────────────────────────────────

async function generatePDF(report: Report, insights: PreviewInsight[]): Promise<void> {
  const { jsPDF } = await import("jspdf");

  // Page dimensions (letter, points)
  const W = 612, H = 792;
  const ML = 60, MR = 60;
  const MT = 68, MB = 72;
  const CW = W - ML - MR; // 492

  const doc = new jsPDF({ unit: "pt", format: "letter" });

  // ── Color palettes ──────────────────────────────────────────────────────────
  // Sourced from globals.css @theme values
  type RGB = [number, number, number];
  const FOREST:       RGB = [61,  90,  62 ];  // #3D5A3E
  const BARK:         RGB = [42,  38,  32 ];  // #2A2620
  const BARK_LIGHT:   RGB = [74,  69,  64 ];  // #4A4540
  const STONE:        RGB = [138, 130, 120];  // #8A8278
  const STONE_LIGHT:  RGB = [184, 178, 168];  // #B8B2A8
  // Section number: bark at ~20% on #F9F7F4
  const NUM_COLOR:    RGB = [208, 205, 202];
  // Rule / divider: stone-light at ~30% on #F9F7F4
  const DIVIDER_C:    RGB = [230, 226, 221];
  // Insight card fills (pre-mixed onto #F9F7F4 bg)
  // bg-forest/6 on #F9F7F4: [238, 238, 233]
  // bg-sage/10 on #F9F7F4 (sage=#7A9E7E): [236, 238, 232]
  const CARD_FILL_A:  RGB = [238, 238, 233];
  const CARD_FILL_B:  RGB = [236, 238, 232];
  // border-stone-light/30 on #F9F7F4: [230, 226, 221]
  const CARD_BORDER:  RGB = [230, 226, 221];

  const tc = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const lc = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const fc = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);

  // ── Rich text helpers ───────────────────────────────────────────────────────
  type Seg = { text: string; bold: boolean };

  const parseRich = (text: string): Seg[] =>
    text.split(/(\*\*[^*]+\*\*)/g)
      .map((p) => ({
        text: p.startsWith("**") && p.endsWith("**") ? p.slice(2, -2) : p,
        bold: p.startsWith("**") && p.endsWith("**"),
      }))
      .filter((s) => s.text.length > 0);

  const wrapRich = (text: string, maxW: number, fs: number): Seg[][] => {
    const tokens: Seg[] = [];
    for (const seg of parseRich(text)) {
      for (const part of seg.text.split(/(\s+)/)) {
        if (part.length > 0) tokens.push({ text: part, bold: seg.bold });
      }
    }
    const lines: Seg[][] = [];
    let line: Seg[] = [], lineW = 0;
    for (const tok of tokens) {
      if (line.length === 0 && tok.text.trim() === "") continue;
      doc.setFont("times", tok.bold ? "bold" : "normal");
      doc.setFontSize(fs);
      const tw = doc.getTextWidth(tok.text);
      if (line.length > 0 && tok.text.trim() !== "" && lineW + tw > maxW) {
        while (line.length > 0 && line[line.length - 1].text.trim() === "") line.pop();
        lines.push(line);
        line = []; lineW = 0;
        if (tok.text.trim() === "") continue;
      }
      line.push(tok); lineW += tw;
    }
    while (line.length > 0 && line[line.length - 1].text.trim() === "") line.pop();
    if (line.length > 0) lines.push(line);
    return lines;
  };

  const drawRichLine = (
    line: Seg[], x: number, y: number, fs: number,
    nc: RGB, bc: RGB
  ) => {
    let cx = x;
    for (const seg of line) {
      doc.setFont("times", seg.bold ? "bold" : "normal");
      doc.setFontSize(fs);
      tc(seg.bold ? bc : nc);
      doc.text(seg.text, cx, y);
      cx += doc.getTextWidth(seg.text);
    }
    doc.setFont("times", "normal");
  };

  // ── Pagination ──────────────────────────────────────────────────────────────
  // pageNum tracks the current page; footer is stamped when leaving a page.
  // pastCover gates the footer so the cover never gets a page number.
  let pageNum = 1;
  let pastCover = false;

  const addFooter = () => {
    if (!pastCover) return;
    doc.setFont("times", "normal");
    doc.setFontSize(8);
    tc(STONE_LIGHT);
    doc.text(String(pageNum), W / 2, H - 30, { align: "center" });
    doc.text("sonder-me.com", W - MR, H - 30, { align: "right" });
  };

  const newPage = () => {
    addFooter();      // stamp footer on the page we're leaving
    doc.addPage();
    pageNum++;
    pastCover = true; // everything after the cover gets a footer
  };

  const guard = (y: number, need: number): number => {
    if (y + need > H - MB) { newPage(); return MT; }
    return y;
  };

  // ── Body paragraph renderer ─────────────────────────────────────────────────
  const BODY_FS = 11;
  const LINE_H  = 16;
  const PARA_GAP = 10;

  const renderBody = (content: string, startY: number): number => {
    let y = startY;
    for (const para of content.split(/\n+/).filter(Boolean)) {
      const lines = wrapRich(para, CW, BODY_FS);
      y = guard(y, lines.length * LINE_H + PARA_GAP);
      for (const ln of lines) {
        drawRichLine(ln, ML, y, BODY_FS, BARK_LIGHT, BARK);
        y += LINE_H;
      }
      y += PARA_GAP;
    }
    return y;
  };

  // ── Section 9 outline renderer ──────────────────────────────────────────────
  const S9_FS = 10.5;
  const S9_LINE_H = 15;
  const S9_GAP = 8;

  const renderSection9 = (content: string, startY: number): number => {
    let y = startY;
    let firstHeader = true;

    for (const line of content.split(/\n/).map((l) => l.trim()).filter(Boolean)) {

      // Part header: **Books** / **Journal Prompts** / **Daily Practices**
      if (/^\*\*[^*]+\*\*$/.test(line)) {
        const extra = firstHeader ? 0 : 12;
        y = guard(y, 36 + extra);
        y += extra;
        firstHeader = false;
        doc.setFont("times", "bold");
        doc.setFontSize(13);
        tc(BARK);
        doc.text(line.slice(2, -2), ML, y);
        y += 22;
        continue;
      }

      // Numbered journal prompt
      if (/^\d+\./.test(line)) {
        const num = line.match(/^(\d+)\.\s*/)?.[1] ?? "";
        const body = line.replace(/^\d+\.\s*/, "");
        const wrappedLines = wrapRich(body, CW - 22, S9_FS);
        y = guard(y, wrappedLines.length * S9_LINE_H + S9_GAP);
        doc.setFont("times", "bold");
        doc.setFontSize(S9_FS);
        tc(FOREST);
        doc.text(`${num}.`, ML + 2, y);
        for (const wl of wrappedLines) {
          drawRichLine(wl, ML + 18, y, S9_FS, BARK_LIGHT, BARK);
          y += S9_LINE_H;
        }
        y += S9_GAP;
        continue;
      }

      // Book/practice item — starts with **Title** followed by more content
      if (line.startsWith("**")) {
        const wrappedLines = wrapRich(line, CW - 10, S9_FS);
        y = guard(y, wrappedLines.length * S9_LINE_H + S9_GAP);
        for (const wl of wrappedLines) {
          drawRichLine(wl, ML + 8, y, S9_FS, BARK_LIGHT, BARK);
          y += S9_LINE_H;
        }
        y += S9_GAP;
        continue;
      }

      // Fallback: plain paragraph
      const wrappedLines = wrapRich(line, CW, S9_FS);
      y = guard(y, wrappedLines.length * S9_LINE_H + S9_GAP);
      for (const wl of wrappedLines) {
        drawRichLine(wl, ML, y, S9_FS, BARK_LIGHT, BARK);
        y += S9_LINE_H;
      }
      y += S9_GAP;
    }
    return y;
  };

  // ── COVER PAGE ──────────────────────────────────────────────────────────────

  // Wordmark
  doc.setFont("times", "bold");
  doc.setFontSize(44);
  tc(FOREST);
  doc.text("Sonder", W / 2, 218, { align: "center" });

  // Ornament: flanking lines + center cross-mark
  lc(STONE_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 88, 248, W / 2 - 10, 248);
  doc.line(W / 2 + 10, 248, W / 2 + 88, 248);
  doc.line(W / 2, 243, W / 2, 253);
  doc.line(W / 2 - 6, 248, W / 2 + 6, 248);

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  tc(BARK);
  doc.text("Your Sonder Report", W / 2, 298, { align: "center" });

  // Date
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  tc(STONE);
  doc.text(TODAY, W / 2, 322, { align: "center" });

  // Tagline near bottom
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  tc(STONE_LIGHT);
  doc.text("You are sondering.", W / 2, H - 108, { align: "center" });

  // Domain on cover (no page number; addFooter is gated by pastCover)
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  tc(STONE_LIGHT);
  doc.text("sonder-me.com", W / 2, H - 36, { align: "center" });

  // ── INSIGHTS PAGE (page 2) ──────────────────────────────────────────────────

  if (insights.length > 0) {
    newPage();
    let y = MT;

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    tc(FOREST);
    doc.text("THREE TRUTHS FROM YOUR SONDER", ML, y, { charSpace: 1.2 });
    y += 22;

    // Cards
    const CARD_PAD_X = 18;
    const CARD_PAD_Y = 14;
    const CARD_BODY_W = CW - CARD_PAD_X * 2;
    const CARD_TITLE_FS = 7.5;
    const CARD_BODY_FS = 10.5;
    const CARD_BODY_LH = 14;

    for (let ci = 0; ci < Math.min(insights.length, 3); ci++) {
      const insight = insights[ci];

      // Pre-calculate body wrap (helvetica normal) to size the card
      doc.setFont("helvetica", "normal");
      doc.setFontSize(CARD_BODY_FS);
      const bodyLines = doc.splitTextToSize(insight.insight, CARD_BODY_W) as string[];
      const cardH = CARD_PAD_Y + 9 + 8 + bodyLines.length * CARD_BODY_LH + CARD_PAD_Y;

      y = guard(y, cardH + 8);

      // Card background + border
      fc(ci === 1 ? CARD_FILL_B : CARD_FILL_A);
      lc(CARD_BORDER);
      doc.setLineWidth(0.5);
      doc.roundedRect(ML, y, CW, cardH, 3, 3, "FD");

      // Card title (small, uppercase, forest, slight tracking)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(CARD_TITLE_FS);
      tc(FOREST);
      doc.text(insight.title.toUpperCase(), ML + CARD_PAD_X, y + CARD_PAD_Y + 9, { charSpace: 0.7 });

      // Card body text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(CARD_BODY_FS);
      tc(BARK);
      let textY = y + CARD_PAD_Y + 9 + 8 + CARD_BODY_LH;
      for (const line of bodyLines) {
        doc.text(line, ML + CARD_PAD_X, textY);
        textY += CARD_BODY_LH;
      }

      y += cardH + 8;
    }
  }

  // ── SECTION PAGES ───────────────────────────────────────────────────────────

  for (let si = 0; si < report.sections.length; si++) {
    const section = report.sections[si];
    newPage();
    let y = MT;

    // Section number (large, muted)
    doc.setFont("times", "bold");
    doc.setFontSize(52);
    tc(NUM_COLOR);
    doc.text(String(si + 1).padStart(2, "0"), ML, y + 44);
    y += 56;

    // Thin rule
    lc(DIVIDER_C);
    doc.setLineWidth(0.4);
    doc.line(ML, y, ML + CW, y);
    y += 16;

    // Section title
    doc.setFont("times", "bold");
    doc.setFontSize(21);
    tc(BARK);
    const titleLines = doc.splitTextToSize(section.title, CW) as string[];
    doc.text(titleLines, ML, y + 21);
    y += titleLines.length * 25 + 12;

    // Content
    y = section.title === "Your Next 90 Days"
      ? renderSection9(section.content, y)
      : renderBody(section.content, y);
  }

  // Footer on last page
  addFooter();

  doc.save("Your-Sonder-Report.pdf");
}

// ─── Download Button ──────────────────────────────────────────────────────────

function DownloadButton({
  downloading,
  onDownload,
}: {
  downloading: boolean;
  onDownload: () => void;
}) {
  return (
    <div className="no-print">
      <button
        className="bg-forest text-parchment text-sm font-medium px-8 py-3 rounded-full hover:bg-forest-light transition-colors duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={onDownload}
        disabled={downloading}
      >
        {downloading ? "Generating PDF…" : "Download PDF"}
      </button>
    </div>
  );
}

// ─── Full Report ──────────────────────────────────────────────────────────────

function FullReport({ report }: { report: Report }) {
  const [downloading, setDownloading] = useState(false);
  const [insights, setInsights] = useState<PreviewInsight[]>([]);

  // Load preview insights from localStorage (generated on the preview page)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sonder_preview");
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.previewInsights)) {
          setInsights(data.previewInsights);
        }
      }
    } catch {
      // preview not available — graceful degradation
    }
  }, []);

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      await generatePDF(report, insights);
    } catch (err) {
      console.error("PDF generation failed, falling back to print:", err);
      window.print();
    } finally {
      setDownloading(false);
    }
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
          <p className="no-print text-xs text-stone italic max-w-md mx-auto leading-relaxed mb-3">
            Save or print this report now — for your privacy, we do not store your data
            and this page will not be accessible after you close your browser.
          </p>

          {/* Disclaimer — hidden in print */}
          <p className="no-print text-xs text-stone-light italic max-w-md mx-auto leading-relaxed mb-8">
            Sonder is a self-reflection tool based on validated psychological research frameworks. It is not a clinical assessment, therapy, or substitute for professional mental health care. If you are experiencing a mental health crisis, please contact the 988 Suicide and Crisis Lifeline by calling or texting 988.
          </p>

          <DownloadButton downloading={downloading} onDownload={handleDownloadPDF} />
        </div>

        {/* Preview insights opener — shown if available from localStorage */}
        {insights.length > 0 && (
          <div className="mb-12">
            <p className="text-xs font-medium text-forest tracking-widest uppercase mb-6">
              Three Truths From Your Sonder
            </p>
            <div className="flex flex-col gap-4 mb-10">
              {insights.map((insight, i) => (
                <InsightCardReport key={i} insight={insight} index={i} />
              ))}
            </div>
            <div className="h-px bg-stone-light/30" />
          </div>
        )}

        {/* Sections */}
        <div className={insights.length > 0 ? "mt-12" : ""}>
          {report.sections.map((section, i) => (
            <div key={i}>
              <Section section={section} index={i} />
              {i < report.sections.length - 1 && (
                <div className="print-divider h-px bg-stone-light/30 my-12" />
              )}
            </div>
          ))}
        </div>

        {/* Closing line */}
        <p
          className="mt-16 text-center text-sm text-stone-light italic"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          You are sondering.
        </p>

        {/* Bottom download button — hidden in print */}
        <div className="mt-10 flex justify-center">
          <DownloadButton downloading={downloading} onDownload={handleDownloadPDF} />
        </div>
      </main>
    </div>
  );
}

// ─── Insight Card (report page) ───────────────────────────────────────────────

function InsightCardReport({
  insight,
  index,
}: {
  insight: PreviewInsight;
  index: number;
}) {
  const accents = ["bg-forest/6", "bg-sage/10", "bg-forest/6"];
  return (
    <div className={`${accents[index]} border border-stone-light/30 rounded px-6 py-5`}>
      <p className="text-xs font-semibold text-forest uppercase tracking-widest mb-2">
        {insight.title}
      </p>
      <p className="text-bark text-sm sm:text-base leading-relaxed">
        {insight.insight}
      </p>
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
        {section.title === "Your Next 90 Days"
          ? <Section9Content content={section.content} />
          : (
            <div className="flex flex-col gap-4">
              {section.content.split(/\n+/).filter(Boolean).map((para, i) => (
                <p key={i} className="print-para text-bark-light leading-relaxed text-base sm:text-[1.0625rem]">
                  {renderInlineBold(para)}
                </p>
              ))}
            </div>
          )}
      </div>
    </>
  );
}

// ─── Section 9 outline renderer ───────────────────────────────────────────────

function Section9Content({ content }: { content: string }) {
  const lines = content.split(/\n/).map((l) => l.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-1.5">
      {lines.map((line, i) => {
        // Part header: line is *only* **Text** — nothing before or after the bold markers
        if (/^\*\*[^*]+\*\*$/.test(line)) {
          return (
            <p
              key={i}
              className="font-serif font-semibold text-bark text-base sm:text-lg mt-6 mb-1 first:mt-0"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {line.slice(2, -2)}
            </p>
          );
        }

        // Numbered journal prompt: starts with 1. / 2. / 3.
        if (/^\d+\./.test(line)) {
          const num = line.match(/^(\d+)\.\s*/)?.[1] ?? "";
          const body = line.replace(/^\d+\.\s*/, "");
          return (
            <div key={i} className="flex gap-3 pl-2">
              <span className="text-forest font-semibold text-sm mt-0.5 shrink-0 w-4">{num}.</span>
              <p className="print-para text-bark-light leading-relaxed text-sm sm:text-base">
                {renderInlineBold(body)}
              </p>
            </div>
          );
        }

        // Book or practice item: line starts with **Title** followed by more content
        if (line.startsWith("**")) {
          return (
            <div key={i} className="pl-2">
              <p className="print-para text-bark-light leading-relaxed text-sm sm:text-base">
                {renderInlineBold(line)}
              </p>
            </div>
          );
        }

        // Fallback: plain paragraph
        return (
          <p key={i} className="print-para text-bark-light leading-relaxed text-sm sm:text-base">
            {renderInlineBold(line)}
          </p>
        );
      })}
    </div>
  );
}
