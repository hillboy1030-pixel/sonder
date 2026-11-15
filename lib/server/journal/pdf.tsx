/* eslint-disable react/display-name -- page builders return elements; they are not components */
// Renders the print-ready journal for Lulu: a black-and-white 6x9 paperback
// interior (with 0.125 in bleed) and a full-colour wraparound cover.
//
// Every page is laid out explicitly so we always know which side of the spine
// it falls on: odd pages sit right of the spine, even pages left. Each day is
// a two-page spread (prompt page on the left, writing page on the right).

import path from "node:path";
import { Circle, Defs, Document, Font, LinearGradient, Page, Path, Rect, RadialGradient, Stop, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { PHASES, type JournalContent } from "@/lib/journal/types";

// ─── Fonts ────────────────────────────────────────────────────────────────────

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
let fontsReady = false;
function registerFonts() {
  if (fontsReady) return;
  fontsReady = true;
  const f = (name: string) => path.join(FONT_DIR, name);
  Font.register({
    family: "Literata",
    fonts: [
      { src: f("literata-latin-400-normal.woff"), fontWeight: 400 },
      { src: f("literata-latin-400-italic.woff"), fontWeight: 400, fontStyle: "italic" },
      { src: f("literata-latin-500-normal.woff"), fontWeight: 500 },
      { src: f("literata-latin-500-italic.woff"), fontWeight: 500, fontStyle: "italic" },
      { src: f("literata-latin-600-normal.woff"), fontWeight: 600 },
      { src: f("literata-latin-600-italic.woff"), fontWeight: 600, fontStyle: "italic" },
    ],
  });
  Font.register({
    family: "NationalPark",
    fonts: [
      { src: f("national-park-latin-400-normal.woff"), fontWeight: 400 },
      { src: f("national-park-latin-600-normal.woff"), fontWeight: 600 },
      { src: f("national-park-latin-700-normal.woff"), fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
}

// ─── Geometry (points: 72 per inch) ───────────────────────────────────────────

const IN = 72;
const BLEED = 0.125 * IN;
const TRIM_W = 6 * IN;
const TRIM_H = 9 * IN;
const PAGE: [number, number] = [TRIM_W + BLEED * 2, TRIM_H + BLEED * 2];
const INSIDE = BLEED + 1.0 * IN; // safety margin + gutter for 151–400 pages
const OUTSIDE = BLEED + 0.6 * IN;
const TOP = BLEED + 0.62 * IN;
const BOTTOM = BLEED + 0.7 * IN;

// Greys only: the interior prints in black and white.
const INK = "#1E1E1E";
const SOFT = "#555555";
const FAINT = "#8A8A8A";
const RULE = "#B9B9B9";

const SIGN = "NationalPark";
const READ = "Literata";

// ─── Building blocks ──────────────────────────────────────────────────────────

function Sheet({ n, children, folio = true, label }: { n: number; children: ReactNode; folio?: boolean; label?: string }) {
  const right = n % 2 === 1; // odd pages sit right of the spine
  return (
    <Page
      size={PAGE}
      style={{
        paddingTop: TOP,
        paddingBottom: BOTTOM,
        paddingLeft: right ? INSIDE : OUTSIDE,
        paddingRight: right ? OUTSIDE : INSIDE,
        fontFamily: READ,
        color: INK,
      }}
    >
      <View style={{ flexGrow: 1, flexDirection: "column" }}>{children}</View>
      {folio && (
        <View
          fixed
          style={{
            position: "absolute",
            bottom: BLEED + 0.38 * IN,
            left: right ? INSIDE : OUTSIDE,
            right: right ? OUTSIDE : INSIDE,
            flexDirection: right ? "row-reverse" : "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontFamily: SIGN, fontSize: 8, color: FAINT }}>{n}</Text>
          {label ? <Text style={{ fontFamily: SIGN, fontSize: 8, color: FAINT }}>{label}</Text> : null}
        </View>
      )}
    </Page>
  );
}

/** A small empty circle to tick by hand (drawn, so it never depends on a font glyph). */
const Dot = () => <View style={{ width: 7, height: 7, borderRadius: 3.5, borderWidth: 0.7, borderColor: SOFT, marginRight: 3 }} />;
const Small = ({ children }: { children: ReactNode }) => <Text style={{ fontFamily: SIGN, fontSize: 8.5, color: SOFT, marginRight: 8 }}>{children}</Text>;

const Label = ({ children, style = {} }: { children: ReactNode; style?: object }) => (
  <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 8.5, color: SOFT, letterSpacing: 0.3, marginBottom: 4, ...style }}>{children}</Text>
);

/** Writing lines that fill whatever space is left on the page. */
function Lines({ gap = 24 }: { gap?: number }) {
  return (
    // The lines are positioned absolutely, so they never push the page longer;
    // the box clips them to the space that's left.
    <View style={{ flexGrow: 1, flexBasis: 0, position: "relative", overflow: "hidden" }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={{ height: gap, borderBottomWidth: 0.6, borderBottomColor: RULE, borderBottomStyle: "solid" }} />
        ))}
      </View>
    </View>
  );
}

function Paragraphs({ text, size = 10.5 }: { text: string; size?: number }) {
  return (
    <View>
      {text.split(/\n\s*\n/).map((p, i) => (
        <Text key={i} style={{ fontSize: size, lineHeight: 1.55, marginBottom: size * 0.8 }}>
          {p.trim()}
        </Text>
      ))}
    </View>
  );
}

/** Fit a letter on one page: shorter letters get a little more room to breathe. */
const letterSize = (text: string) => {
  const words = text.split(/\s+/).length;
  return words > 290 ? 9.4 : words > 240 ? 9.9 : 10.5;
};

function Mountain({ width = 120 }: { width?: number }) {
  return (
    <Svg viewBox="0 0 120 40" style={{ width, height: (width * 40) / 120 }}>
      <Path d="M2 38 L34 14 L48 24 L66 6 L90 26 L102 18 L118 38 Z" fill="none" stroke={SOFT} strokeWidth={1.2} />
      <Path d="M66 6 L66 0 L74 2.5 L66 5" fill={SOFT} />
    </Svg>
  );
}

// ─── Page types ───────────────────────────────────────────────────────────────

type PageSpec = (n: number) => ReactNode;

function titlePage(c: JournalContent): PageSpec {
  return (n) => (
    <Sheet key={n} n={n} folio={false}>
      <View style={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
        <Mountain width={110} />
        <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 40, marginTop: 22 }}>Sonder</Text>
        <Text style={{ fontStyle: "italic", fontSize: 13, color: SOFT, marginTop: 8 }}>Ninety days, one page at a time</Text>
      </View>
      <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 11, textAlign: "center", color: SOFT }}>Written for {c.firstName}</Text>
    </Sheet>
  );
}

function colophonPage(c: JournalContent): PageSpec {
  return (n) => (
    <Sheet key={n} n={n} folio={false}>
      <View style={{ flexGrow: 1, justifyContent: "flex-end" }}>
        <Text style={{ fontSize: 8, lineHeight: 1.6, color: SOFT }}>
          This journal was written for {c.firstName} by Ember, the guide inside Sonder, from {c.firstName}&rsquo;s Sonder Report and
          the answers {c.firstName} shared. It was printed as a single copy.
        </Text>
        <Text style={{ fontSize: 8, lineHeight: 1.6, color: SOFT, marginTop: 8 }}>
          Sonder is a tool for reflection. It is not therapy, a diagnosis, or a substitute for professional care. If you are in
          crisis in the US, call or text 988, any time.
        </Text>
        <Text style={{ fontSize: 8, color: SOFT, marginTop: 8 }}>© {new Date().getFullYear()} Sonder</Text>
      </View>
    </Sheet>
  );
}

function dedicationPage(c: JournalContent): PageSpec {
  return (n) => (
    <Sheet key={n} n={n} folio={false}>
      <View style={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 10 }}>
        <Text style={{ fontStyle: "italic", fontSize: 13, lineHeight: 1.5, textAlign: "center", color: SOFT }}>{c.dedication}</Text>
      </View>
    </Sheet>
  );
}

const blankPage: PageSpec = (n) => <Sheet key={n} n={n} folio={false}>{null}</Sheet>;

function letterPage(title: string, text: string, sign = true): PageSpec {
  return (n) => (
    <Sheet key={n} n={n}>
      <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 18, marginBottom: 16 }}>{title}</Text>
      <Paragraphs text={text} size={letterSize(text)} />
      {sign && <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 9.5, color: SOFT, marginTop: 4 }}>Ember, your guide</Text>}
    </Sheet>
  );
}

function mapPage(c: JournalContent): PageSpec {
  return (n) => (
    <Sheet key={n} n={n}>
      <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 18 }}>Your map</Text>
      <Text style={{ fontSize: 9.5, color: SOFT, marginTop: 6, lineHeight: 1.5 }}>
        What your climb showed, and the lines from your report worth carrying. Come back here when you lose the trail.
      </Text>
      {c.words.length > 0 && (
        <View style={{ marginTop: 20, paddingVertical: 12, borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: RULE }}>
          <Label>Your four stones</Label>
          <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 14 }}>{c.words.join("  ·  ")}</Text>
        </View>
      )}
      <View style={{ marginTop: 18 }}>
        {c.carry.slice(0, 8).map((l, i) => (
          <View key={i} style={{ marginBottom: 11 }}>
            <Label>{l.title}</Label>
            <Text style={{ fontSize: 10.5, lineHeight: 1.45 }}>{l.line}</Text>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

const howToPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 18, marginBottom: 14 }}>How this works</Text>
    {[
      ["In the morning", "Read the few lines from me and today's challenge. It should take a minute."],
      ["During the day", "Do the challenge. It's small on purpose. Five minutes, not fifty."],
      ["At night", "Answer the question on the left page. Use the right page for anything else that wants out."],
      ["Every seventh day", "A check-in. Look back over the week and notice what's shifting."],
      ["Three stretches", "Ground (days 1–30) is for noticing. Climb (31–60) is for practicing. Return (61–90) is for making it yours."],
      ["If you miss a day", "Pick up where you are. Missed days are part of the trail, not a failure of it."],
    ].map(([h, b]) => (
      <View key={h} style={{ marginBottom: 12 }}>
        <Label>{h}</Label>
        <Text style={{ fontSize: 10.5, lineHeight: 1.5 }}>{b}</Text>
      </View>
    ))}
    <View style={{ marginTop: "auto", paddingTop: 10, borderTopWidth: 0.6, borderColor: RULE }}>
      <Text style={{ fontSize: 8.5, lineHeight: 1.5, color: SOFT }}>
        If things ever feel too heavy, put the book down and talk to someone you trust. In the US you can call or text 988, any time.
      </Text>
    </View>
  </Sheet>
);

function writeLetterPage(title: string, intro: string, continued = false): PageSpec {
  return (n) => (
    <Sheet key={n} n={n}>
      {continued ? null : (
        <>
          <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 16 }}>{title}</Text>
          <Text style={{ fontStyle: "italic", fontSize: 10, color: SOFT, marginTop: 6, marginBottom: 12, lineHeight: 1.5 }}>{intro}</Text>
        </>
      )}
      <Lines />
    </Sheet>
  );
}

function phaseTitlePage(i: number): PageSpec {
  const p = PHASES[i];
  return (n) => (
    <Sheet key={n} n={n} folio={false}>
      <View style={{ flexGrow: 1, justifyContent: "center" }}>
        <Text style={{ fontFamily: SIGN, fontSize: 11, color: SOFT }}>
          Part {i + 1} · Days {p.first}–{p.first + 29}
        </Text>
        <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 46, marginTop: 6 }}>{p.name}</Text>
        <Text style={{ fontStyle: "italic", fontSize: 14, color: SOFT, marginTop: 4 }}>{p.focus}</Text>
        <View style={{ marginTop: 26 }}>
          <Mountain width={90} />
        </View>
      </View>
    </Sheet>
  );
}

function phaseLetterPage(c: JournalContent, i: number): PageSpec {
  return (n) => (
    <Sheet key={n} n={n} label={PHASES[i].name}>
      <View style={{ flexGrow: 1, justifyContent: "center" }}>
        <Label>From your guide</Label>
        <Paragraphs text={c.phases[i].letter} size={11} />
      </View>
    </Sheet>
  );
}

function dayLeftPage(c: JournalContent, phase: number, d: number): PageSpec {
  const day = c.phases[phase].days[d];
  const num = PHASES[phase].first + d;
  return (n) => (
    <Sheet key={n} n={n} label={PHASES[phase].name}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 7, borderBottomWidth: 0.6, borderColor: RULE }}>
        <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 15 }}>Day {num}</Text>
        <Text style={{ fontFamily: SIGN, fontSize: 8.5, color: SOFT }}>Date ______________</Text>
      </View>
      <View style={{ marginTop: 16 }}>
        <Label>From your guide</Label>
        <Text style={{ fontStyle: "italic", fontSize: 10.5, lineHeight: 1.5, color: SOFT }}>{day.lesson}</Text>
      </View>
      <View style={{ marginTop: 14 }}>
        <Label>Today&rsquo;s challenge</Label>
        <Text style={{ fontSize: 12.5, lineHeight: 1.4 }}>{day.challenge}</Text>
      </View>
      <View style={{ marginTop: 14, marginBottom: 6 }}>
        <Label>Tonight, write</Label>
        <Text style={{ fontStyle: "italic", fontSize: 10.5, lineHeight: 1.45 }}>{day.prompt}</Text>
      </View>
      <Lines />
    </Sheet>
  );
}

function dayRightPage(phase: number, d: number): PageSpec {
  const num = PHASES[phase].first + d;
  return (n) => (
    <Sheet key={n} n={n} label={`Day ${num}`}>
      <Lines />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTopWidth: 0.6, borderColor: RULE }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Small>Did it:</Small>
          <Dot /><Small>yes</Small>
          <Dot /><Small>partly</Small>
          <Dot /><Small>not today</Small>
        </View>
        <Text style={{ fontFamily: SIGN, fontSize: 8.5, color: SOFT }}>One word: __________</Text>
      </View>
    </Sheet>
  );
}

function checkinLeftPage(c: JournalContent, phase: number, w: number): PageSpec {
  const week = phase * 4 + w + 1;
  return (n) => (
    <Sheet key={n} n={n} label={PHASES[phase].name}>
      <Text style={{ fontFamily: SIGN, fontSize: 9, color: SOFT }}>Week {week} of 12</Text>
      <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 18, marginTop: 2 }}>Check-in</Text>
      <Text style={{ fontStyle: "italic", fontSize: 11, lineHeight: 1.5, marginTop: 12 }}>{c.phases[phase].checkins[w]}</Text>
      <View style={{ height: 6 }} />
      <Lines gap={22} />
    </Sheet>
  );
}

function checkinRightPage(phase: number): PageSpec {
  const block = (label: string, lines: number) => (
    <View style={{ marginBottom: 14 }}>
      <Label>{label}</Label>
      {Array.from({ length: lines }).map((_, i) => (
        <View key={i} style={{ height: 22, borderBottomWidth: 0.6, borderColor: RULE }} />
      ))}
    </View>
  );
  return (n) => (
    <Sheet key={n} n={n} label={PHASES[phase].name}>
      {block("Something that shifted this week", 6)}
      {block("Something that was hard", 5)}
      {block("One thing to carry into next week", 5)}
      <View style={{ marginTop: "auto" }}>
        <Label>How the week felt</Label>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <Small>heavy</Small>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              <Dot />
              {i < 4 && <View style={{ width: 14, height: 0.6, backgroundColor: RULE, marginRight: 3 }} />}
            </View>
          ))}
          <Small>  light</Small>
        </View>
      </View>
    </Sheet>
  );
}

const keepingPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 16 }}>What I&rsquo;m keeping</Text>
    <Text style={{ fontStyle: "italic", fontSize: 10, color: SOFT, marginTop: 6, marginBottom: 12 }}>
      The practices, words, and people that are coming with you.
    </Text>
    <Lines />
  </Sheet>
);

const notesPage: PageSpec = (n) => (
  <Sheet key={n} n={n} label="Notes">
    <Lines />
  </Sheet>
);

const supportPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <View style={{ flexGrow: 1, justifyContent: "center" }}>
      <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 16 }}>If things get heavy</Text>
      <Text style={{ fontSize: 10.5, lineHeight: 1.55, marginTop: 10 }}>
        This journal is for reflection, not for carrying everything alone. If you&rsquo;re struggling, talk to someone you trust,
        or to a professional.
      </Text>
      <Text style={{ fontSize: 10.5, lineHeight: 1.55, marginTop: 8 }}>
        In the US, you can call or text 988 any time to reach the Suicide &amp; Crisis Lifeline. Outside the US, findahelpline.com
        lists free, confidential support near you.
      </Text>
    </View>
  </Sheet>
);

// ─── Assembly ─────────────────────────────────────────────────────────────────

export function journalPages(c: JournalContent): PageSpec[] {
  const pages: PageSpec[] = [
    titlePage(c), // 1
    colophonPage(c), // 2
    dedicationPage(c), // 3
    blankPage, // 4
    letterPage("Before you begin", c.opening), // 5
    mapPage(c), // 6
    howToPage, // 7
    writeLetterPage("A letter to day 90", "Write to the person you'll be at the end of these ninety days. What do you hope they know? What do you want them to remember about today?"), // 8
    writeLetterPage("", "", true), // 9
  ];
  PHASES.forEach((_, i) => {
    pages.push(phaseTitlePage(i), phaseLetterPage(c, i));
    for (let d = 0; d < 30; d++) {
      pages.push(dayLeftPage(c, i, d), dayRightPage(i, d));
      if (d % 7 === 6 && d < 28) pages.push(checkinLeftPage(c, i, Math.floor(d / 7)), checkinRightPage(i));
    }
  });
  pages.push(
    writeLetterPage("A letter back to day 1", "Write back to the person who opened this book. What would you tell them now?"),
    writeLetterPage("", "", true),
    letterPage("After day 90", c.closing),
    keepingPage,
    supportPage
  );
  while (pages.length % 4 !== 0) pages.push(notesPage);
  return pages;
}

export async function renderInterior(c: JournalContent): Promise<{ pdf: Buffer; pages: number }> {
  registerFonts();
  const specs = journalPages(c);
  const doc = (
    <Document title={`Sonder Journal for ${c.firstName}`} author="Sonder" creator="Sonder" producer="Sonder">
      {specs.map((spec, i) => spec(i + 1))}
    </Document>
  );
  return { pdf: await renderToBuffer(doc), pages: specs.length };
}

// ─── Cover ────────────────────────────────────────────────────────────────────

/** Lulu paperback spine width in inches. Lulu's cover-dimensions API is the source of truth when available. */
export const spineInches = (pages: number) => pages / 444 + 0.06;

function Ember({ size }: { size: number }) {
  return (
    <Svg viewBox="22 38 76 76" style={{ width: size, height: size }}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="64%" r="58%">
          <Stop offset="0%" stopColor="#FFF3D3" />
          <Stop offset="50%" stopColor="#F9D898" />
          <Stop offset="100%" stopColor="#DFA052" />
        </RadialGradient>
        <LinearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#F59A3A" />
          <Stop offset="100%" stopColor="#E97E2C" />
        </LinearGradient>
      </Defs>
      <Circle cx="60" cy="76" r="37.5" fill="#1B342C" />
      <Circle cx="60" cy="76" r="33.5" fill="url(#glow)" />
      <Path
        transform="translate(60 78.5) scale(0.98) translate(-60 -76)"
        d="M60 45 C63.5 54 76.5 62 77.5 79 C78.5 94 70 104 60 104 C50 104 41.5 94 42.5 79 C43.3 68 49.5 61.5 53.5 55.5 C54.2 61.5 57 64 59.8 60.8 C61.2 55.6 59 50.5 60 45 Z"
        fill="url(#flame)"
      />
      <Path
        transform="translate(60 78.5) scale(0.98) translate(-60 -76)"
        d="M60 63 C66 70 71.5 76 71.5 86 C71.5 96 66 101 60 101 C54 101 48.5 96 48.5 86 C48.5 78 53 72 56 67.5 C57 71 59 72 60 69 Z"
        fill="#FFE8B5"
      />
      <Path d="M49.8 85.4 Q53 81.6 56.2 85.4" fill="none" stroke="#3A2212" strokeWidth={1.9} strokeLinecap="round" />
      <Path d="M63.8 85.4 Q67 81.6 70.2 85.4" fill="none" stroke="#3A2212" strokeWidth={1.9} strokeLinecap="round" />
      <Path d="M56 93.5 Q60 97.5 64 93.5" fill="none" stroke="#3A2212" strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export async function renderCover(c: JournalContent, pages: number, size?: { width: number; height: number }): Promise<Buffer> {
  registerFonts();
  const spine = spineInches(pages) * IN;
  const W = size?.width ?? BLEED * 2 + TRIM_W * 2 + spine;
  const H = size?.height ?? TRIM_H + BLEED * 2;
  const spineX = W / 2 - spine / 2;
  const front = spineX + spine; // left edge of the front panel
  const safe = 0.5 * IN;

  const ridge = (pts: string, fill: string) => <Path d={`M0 ${H} ${pts} L${W} ${H} Z`} fill={fill} />;
  const x = (f: number) => (W * f).toFixed(1);

  return renderToBuffer(
    <Document title={`Sonder Journal cover for ${c.firstName}`} author="Sonder">
      <Page size={[W, H]} style={{ position: "relative" }}>
        <Svg style={{ position: "absolute", top: 0, left: 0, width: W, height: H }} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#121F28" />
              <Stop offset="45%" stopColor="#1D3242" />
              <Stop offset="75%" stopColor="#3E5A6C" />
              <Stop offset="100%" stopColor="#8E9A95" />
            </LinearGradient>
            <RadialGradient id="sun" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FBE3AE" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#F4C46F" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={W} height={H} fill="url(#sky)" />
          {Array.from({ length: 70 }).map((_, i) => (
            <Circle key={i} cx={(i * 97.3) % W} cy={(i * 53.7) % (H * 0.5)} r={i % 3 === 0 ? 0.9 : 0.6} fill="#F6F8F7" fillOpacity={0.55} />
          ))}
          <Circle cx={W * 0.72 + 40} cy={H * 0.62} r={150} fill="url(#sun)" />
          {ridge(`L0 ${H * 0.76} L${x(0.1)} ${H * 0.72} L${x(0.22)} ${H * 0.75} L${x(0.35)} ${H * 0.69} L${x(0.48)} ${H * 0.73} L${x(0.62)} ${H * 0.66} L${x(0.72)} ${H * 0.6} L${x(0.78)} ${H * 0.63} L${x(0.88)} ${H * 0.7} L${W} ${H * 0.67}`, "#5D717E")}
          {ridge(`L0 ${H * 0.84} L${x(0.15)} ${H * 0.8} L${x(0.3)} ${H * 0.83} L${x(0.45)} ${H * 0.78} L${x(0.6)} ${H * 0.82} L${x(0.75)} ${H * 0.77} L${x(0.9)} ${H * 0.81} L${W} ${H * 0.79}`, "#3B4D5B")}
          {ridge(`L0 ${H * 0.91} L${x(0.25)} ${H * 0.88} L${x(0.5)} ${H * 0.9} L${x(0.75)} ${H * 0.87} L${W} ${H * 0.89}`, "#13221D")}
          {/* the trail, climbing the front cover to the summit */}
          {Array.from({ length: 30 }).map((_, i) => {
            const t = i / 29;
            const x0 = front + TRIM_W * 0.3;
            const x1 = W * 0.72;
            const cx = x0 + (x1 - x0) * t + 22 * Math.sin(t * 8) * (1 - t);
            const cy = H * (0.93 - 0.33 * t);
            return <Circle key={`t${i}`} cx={cx} cy={cy} r={1.7} fill="#F2B652" />;
          })}
          {/* summit flag */}
          <Path d={`M${W * 0.72} ${H * 0.6} L${W * 0.72} ${H * 0.6 - 26}`} stroke="#F6F8F7" strokeWidth={1.6} />
          <Path d={`M${W * 0.72 + 0.8} ${H * 0.6 - 25} L${W * 0.72 + 19} ${H * 0.6 - 19} L${W * 0.72 + 0.8} ${H * 0.6 - 13} Z`} fill="#E2A23B" />
        </Svg>

        {/* Front cover */}
        <View style={{ position: "absolute", left: front + safe, top: BLEED + safe + 18, width: TRIM_W - safe * 2 }}>
          <Ember size={58} />
          <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 52, color: "#F6F8F7", marginTop: 20 }}>Sonder</Text>
          <Text style={{ fontFamily: READ, fontStyle: "italic", fontSize: 15, color: "#E6ECEA", marginTop: 6 }}>Ninety days, one page at a time</Text>
          <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 12, color: "#EDB75C", marginTop: 26 }}>Written for {c.firstName}</Text>
        </View>

        {/* Spine */}
        {pages > 80 && (
          <View
            style={{
              position: "absolute",
              left: spineX + spine / 2 - (H - BLEED * 2) / 2,
              top: H / 2 - spine / 2,
              width: H - BLEED * 2,
              height: spine,
              transform: "rotate(90deg)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: Math.min(13, spine * 0.45), color: "#F6F8F7" }}>Sonder</Text>
            <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: Math.min(10, spine * 0.36), color: "#EDB75C", marginLeft: 14 }}>
              {c.firstName}&rsquo;s ninety days
            </Text>
          </View>
        )}

        {/* Back cover */}
        <View style={{ position: "absolute", left: BLEED + safe, top: BLEED + safe + 18, width: TRIM_W - safe * 2 }}>
          <Text style={{ fontFamily: READ, fontStyle: "italic", fontSize: 14, lineHeight: 1.5, color: "#F6F8F7" }}>
            &ldquo;{c.carry[0]?.line ?? c.dedication}&rdquo;
          </Text>
          <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 10, color: "#EDB75C", marginTop: 10 }}>Ember, your guide</Text>
          {c.words.length > 0 && (
            <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 11, color: "#C9D3D0", marginTop: 34 }}>{c.words.join("  ·  ")}</Text>
          )}
          <Text style={{ fontFamily: READ, fontSize: 10.5, lineHeight: 1.55, color: "#C9D3D0", marginTop: 18 }}>
            Ninety days of small challenges, written from {c.firstName}&rsquo;s Sonder Report. One page a day: a few lines from your
            guide, one thing to try, and a question for the evening.
          </Text>
        </View>
        <Text style={{ position: "absolute", left: BLEED + safe, bottom: BLEED + safe, fontFamily: SIGN, fontWeight: 600, fontSize: 10, color: "#F6F8F7" }}>
          Sonder · Come inward.
        </Text>
      </Page>
    </Document>
  );
}
