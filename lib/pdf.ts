// Builds the downloadable PDF of the Sonder Report in the browser (nothing is uploaded).

type PreviewInsight = { title: string; insight: string };
type ReportSection = { title: string; content: string };
type Report = { sections: ReportSection[] };

export async function generatePDF(report: Report, insights: PreviewInsight[]): Promise<void> {
  const TODAY = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const site = typeof window !== "undefined" ? window.location.host : "";
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
  const FOREST:       RGB = [33,  63,  53 ];  // pine #213F35
  const BARK:         RGB = [28,  37,  33 ];  // ink #1C2521
  const BARK_LIGHT:   RGB = [75,  91,  86 ];  // slate #4B5B56
  const STONE:        RGB = [123, 136, 131];  // stone #7B8883
  const STONE_LIGHT:  RGB = [201, 211, 206];  // line #C9D3CE
  // Section number: bark at ~20% on #F9F7F4
  const NUM_COLOR:    RGB = [226, 162, 59];
  // Rule / divider: stone-light at ~30% on #F9F7F4
  const DIVIDER_C:    RGB = [220, 227, 223];
  // Insight card fills (pre-mixed onto #F9F7F4 bg)
  // bg-forest/6 on #F9F7F4: [238, 238, 233]
  // bg-sage/10 on #F9F7F4 (sage=#7A9E7E): [236, 238, 232]
  const CARD_FILL_A:  RGB = [236, 241, 238];
  const CARD_FILL_B:  RGB = [231, 237, 233];
  // border-stone-light/30 on #F9F7F4: [230, 226, 221]
  const CARD_BORDER:  RGB = [212, 221, 216];

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
    doc.text(site, W - MR, H - 30, { align: "right" });
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

      // Part header: **Books** / **Start tomorrow** / **A question for this week** (older reports: prompts, practices)
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

  // Ornament: a small mountain range at sunrise
  fc([226, 162, 59]);
  doc.circle(W / 2 + 20, 262, 8, "F");
  fc([110, 127, 120]);
  doc.triangle(W / 2 - 8, 290, W / 2 + 30, 262, W / 2 + 68, 290, "F");
  fc(FOREST);
  doc.triangle(W / 2 - 66, 290, W / 2 - 18, 252, W / 2 + 30, 290, "F");
  lc(STONE_LIGHT);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 96, 290.5, W / 2 + 96, 290.5);

  // Cover title — two-line visual anchor
  doc.setFont("times", "bold");
  doc.setFontSize(42);
  tc(BARK);
  doc.text("A portrait of", W / 2, 356, { align: "center" });
  doc.text("who you are.", W / 2, 410, { align: "center" });

  // Date line — replaces standalone date
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  tc(STONE);
  doc.text(`Generated from your answers on ${TODAY}`, W / 2, 446, { align: "center" });

  // Domain on cover (no page number; addFooter is gated by pastCover)
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  tc(STONE_LIGHT);
  doc.text(site, W / 2, H - 36, { align: "center" });

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
