/* eslint-disable react/display-name -- page builders return elements; they are not components */
// Renders the print-ready journal for Lulu: a black-and-white 6x9 paperback
// interior (with 0.125 in bleed) and a full-colour wraparound cover.
//
// Every page is laid out explicitly so we always know which side of the spine
// it falls on: odd pages sit right of the spine, even pages left. Every day is
// one two-page spread whose layout depends on the kind of day (see the journal
// blueprint in the Sonder project).

import path from "node:path";
import { Circle, Defs, Document, Font, LinearGradient, Page, Path, Rect, RadialGradient, Stop, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { CHECKIN_AFTER, PHASES, phaseOf, weekOf, type DayKind, type JournalContent, type JournalDay } from "@/lib/journal/types";

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
const NIGHT = "#141414";
const PAPER = "#F4F4F4";

const SIGN = "NationalPark";
const READ = "Literata";

// ─── Icons: one small line drawing per kind of day ───────────────────────────

const ICON_PATHS: Record<DayKind, string[]> = {
  practice: ["M7 21 L7 4", "M7 4 L17 4 L15 8 L17 12 L7 12"],
  question: ["M9.5 9 A2.5 2.5 0 1 1 13.2 11.2 C12.4 11.7 12 12.3 12 13.2 L12 14", "M12 17.2 L12 17.6"],
  mirror: ["M12 2 C16 2 18 6 18 10 C18 14 16 18 12 18 C8 18 6 14 6 10 C6 6 8 2 12 2 Z", "M12 18 L12 22", "M8 22 L16 22"],
  dream: ["M19 15 A8 8 0 1 1 9 4 A6.5 6.5 0 0 0 19 15 Z"],
  honest: ["M4 20 L8 19 L19 8 L16 5 L5 16 Z", "M14 7 L17 10"],
  letter: ["M3 6 L21 6 L21 18 L3 18 Z", "M3 7 L12 13 L21 7"],
  wild: ["M12 3 L14.2 9.3 L21 12 L14.2 14.7 L12 21 L9.8 14.7 L3 12 L9.8 9.3 Z"],
  strength: ["M12 3 C15 7 18 9 18 14 A6 6 0 0 1 6 14 C6 11 8 9 9 7 C10 9 11 10 12 10 C12 7 11 5 12 3 Z"],
  savor: ["M12 8 A4 4 0 1 1 11.99 8 Z", "M12 2 L12 4", "M12 20 L12 22", "M2 12 L4 12", "M20 12 L22 12", "M5 5 L6.4 6.4", "M17.6 17.6 L19 19", "M5 19 L6.4 17.6", "M17.6 6.4 L19 5"],
  bestself: ["M3 19 L21 19", "M12 16 L12 5", "M8 9 L12 5 L16 9"],
  retake: ["M20 12 A8 8 0 1 1 17.7 6.3", "M20 3 L20 8 L15 8"],
  rest: ["M2 20 L22 20", "M4 20 L12 6 L20 20", "M9.5 20 C9.5 16.5 10.8 14.5 12 13.5 C13.2 14.5 14.5 16.5 14.5 20", "M12 6 L10.5 3.5"],
};

export const KIND_LABEL: Record<DayKind, string> = {
  practice: "Today's practice",
  question: "A question",
  mirror: "The mirror",
  dream: "Dreams and daydreams",
  honest: "Four honest days",
  letter: "An unsent letter",
  wild: "Wild card",
  strength: "Your strength, used new",
  savor: "Savor",
  bestself: "Your best possible self",
  retake: "The retake",
  rest: "Rest",
};

const KIND_BLURB: Record<DayKind, string> = {
  practice: "A few lines from me, one small thing to try, and a question for the evening.",
  question: "One question on an empty spread. No instructions.",
  mirror: "What bothers you in someone else, and where it lives in you.",
  dream: "A dream or daydream, and a conversation with something in it.",
  honest: "Four days in a row of honest writing, fifteen minutes each.",
  letter: "A letter you'll never send.",
  wild: "Printed on black. I throw out the plan.",
  strength: "One of your strengths, used somewhere new.",
  savor: "Slowing down the good parts.",
  bestself: "Your life going well, written in detail.",
  retake: "Ten statements from your climb, answered again.",
  rest: "Nothing to do. On purpose.",
};

function Icon({ kind, size = 13, color = SOFT }: { kind: DayKind; size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
      {ICON_PATHS[kind].map((d, i) => (
        <Path key={i} d={d} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </Svg>
  );
}

// ─── Building blocks ──────────────────────────────────────────────────────────

function Sheet({
  n,
  children,
  folio = true,
  label,
  dark = false,
}: {
  n: number;
  children?: ReactNode;
  folio?: boolean;
  label?: string;
  dark?: boolean;
}) {
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
        color: dark ? PAPER : INK,
        backgroundColor: dark ? NIGHT : "#FFFFFF",
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
          <Text style={{ fontFamily: SIGN, fontSize: 8, color: dark ? "#9A9A9A" : FAINT }}>{n}</Text>
          {label ? <Text style={{ fontFamily: SIGN, fontSize: 8, color: dark ? "#9A9A9A" : FAINT }}>{label}</Text> : null}
        </View>
      )}
    </Page>
  );
}

const Label = ({ children, style = {}, color = SOFT }: { children: ReactNode; style?: object; color?: string }) => (
  <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 8.5, color, letterSpacing: 0.3, marginBottom: 4, ...style }}>{children}</Text>
);

/** A small empty circle or square to mark by hand (drawn, never a font glyph). */
const Dot = ({ size = 7, square = false }: { size?: number; square?: boolean }) => (
  <View style={{ width: size, height: size, borderRadius: square ? 1 : size / 2, borderWidth: 0.7, borderColor: SOFT, marginRight: 3 }} />
);
const Small = ({ children, style = {} }: { children: ReactNode; style?: object }) => (
  <Text style={{ fontFamily: SIGN, fontSize: 8.5, color: SOFT, marginRight: 8, ...style }}>{children}</Text>
);

/** Writing lines that fill whatever space is left, clipped so they never push the page longer. */
function Lines({ gap = 24, color = RULE }: { gap?: number; color?: string }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: 0, position: "relative", overflow: "hidden" }}>
      <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <View key={i} style={{ height: gap, borderBottomWidth: 0.6, borderBottomColor: color, borderBottomStyle: "solid" }} />
        ))}
      </View>
    </View>
  );
}

/** A fixed number of writing lines. */
const FewLines = ({ count, gap = 22 }: { count: number; gap?: number }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={{ height: gap, borderBottomWidth: 0.6, borderColor: RULE }} />
    ))}
  </View>
);

function Paragraphs({ text, size = 10.5, color }: { text: string; size?: number; color?: string }) {
  return (
    <View>
      {text.split(/\n\s*\n/).map((p, i) => (
        <Text key={i} style={{ fontSize: size, lineHeight: 1.55, marginBottom: size * 0.8, color }}>
          {p.trim()}
        </Text>
      ))}
    </View>
  );
}

/** Fit a letter on one page: longer letters get slightly smaller type. */
const letterSize = (text: string) => {
  const words = text.split(/\s+/).length;
  return words > 290 ? 9.4 : words > 240 ? 9.9 : 10.5;
};

function Mountain({ width = 120, color = SOFT }: { width?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 120 40" style={{ width, height: (width * 40) / 120 }}>
      <Path d="M2 38 L34 14 L48 24 L66 6 L90 26 L102 18 L118 38 Z" fill="none" stroke={color} strokeWidth={1.2} />
      <Path d="M66 6 L66 0 L74 2.5 L66 5" fill={color} />
    </Svg>
  );
}

const Exit = () => (
  <Text style={{ fontStyle: "italic", fontSize: 8.5, color: FAINT, marginBottom: 10 }}>
    If this is too heavy today, write about something else. That counts.
  </Text>
);

/** The header on the left page of every day. */
function DayHead({ day, dark = false }: { day: JournalDay; dark?: boolean }) {
  const wk = weekOf(day.day);
  const color = dark ? "#BDBDBD" : SOFT;
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 7, borderBottomWidth: 0.6, borderColor: dark ? "#555555" : RULE }}>
        <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 15, color: dark ? PAPER : INK }}>Day {day.day}</Text>
        <Text style={{ fontFamily: SIGN, fontSize: 8.5, color }}>Date ______________</Text>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon kind={day.kind} size={11} color={color} />
          <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 8.5, color, marginLeft: 5 }}>{KIND_LABEL[day.kind]}</Text>
        </View>
        <Text style={{ fontFamily: SIGN, fontSize: 8, color }}>
          {wk.label === wk.theme ? wk.theme : `${wk.label} · ${wk.theme}`}
        </Text>
      </View>
    </View>
  );
}

/** "When …, I will …": the plan, set larger than everything else on the page. */
function Plan({ day }: { day: JournalDay }) {
  return (
    <View style={{ marginTop: 14 }}>
      <Label>Today</Label>
      {day.when ? <Text style={{ fontStyle: "italic", fontSize: 10.5, color: SOFT, lineHeight: 1.4 }}>{day.when}</Text> : null}
      <Text style={{ fontSize: 12.5, lineHeight: 1.4, marginTop: 2 }}>{day.then}</Text>
    </View>
  );
}

const Lesson = ({ text }: { text: string }) => (
  <View>
    <Label>From your guide</Label>
    <Text style={{ fontStyle: "italic", fontSize: 10.5, lineHeight: 1.5, color: SOFT }}>{text}</Text>
  </View>
);

const Tonight = ({ text, label = "Tonight" }: { text: string; label?: string }) => (
  <View style={{ marginTop: 14, marginBottom: 6 }}>
    <Label>{label}</Label>
    <Text style={{ fontStyle: "italic", fontSize: 10.5, lineHeight: 1.45 }}>{text}</Text>
  </View>
);

/** An upside-down note from Ember: turn the book over on the day it names. */
function UpsideDown({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ transform: "rotate(180deg)", borderWidth: 0.6, borderColor: RULE, borderRadius: 4, padding: 9, marginTop: 10 }}>
      <Label>{title}</Label>
      {children}
    </View>
  );
}

// ─── The days ─────────────────────────────────────────────────────────────────

type PageSpec = (n: number) => ReactNode;
type Ctx = { c: JournalContent; retakePage: number };

function dayLeft(day: JournalDay, ctx: Ctx): PageSpec {
  const label = PHASES[phaseOf(day.day)].name;
  switch (day.kind) {
    case "wild":
      return (n) => (
        <Sheet key={n} n={n} label={label} dark>
          <DayHead day={day} dark />
          <View style={{ flexGrow: 1, justifyContent: "center", paddingBottom: 40 }}>
            <Icon kind="wild" size={26} color={PAPER} />
            <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 24, color: PAPER, marginTop: 14 }}>Wild card</Text>
            <Text style={{ fontSize: 15, lineHeight: 1.45, color: PAPER, marginTop: 14 }}>{day.lesson}</Text>
          </View>
        </Sheet>
      );
    case "question":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <View style={{ marginTop: 70 }}>
            <Text style={{ fontSize: 19, lineHeight: 1.4, fontWeight: 500 }}>{day.prompt}</Text>
          </View>
        </Sheet>
      );
    case "rest":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <View style={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingBottom: 60 }}>
            <Icon kind="rest" size={38} color={FAINT} />
            <Text style={{ fontStyle: "italic", fontSize: 13, lineHeight: 1.5, color: SOFT, textAlign: "center", marginTop: 18, paddingHorizontal: 18 }}>{day.lesson}</Text>
          </View>
        </Sheet>
      );
    case "mirror":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <Exit />
          <Lesson text={day.lesson} />
          {day.steps.map((s, i) => (
            <View key={i} style={i === 2 ? { marginTop: 13, flexGrow: 1, flexBasis: 0 } : { marginTop: 13 }}>
              <Text style={{ fontSize: 10.5, lineHeight: 1.4 }}>
                {i + 1}. {s}
              </Text>
              {i === 2 ? <Lines gap={22} /> : <FewLines count={3} />}
            </View>
          ))}
        </Sheet>
      );
    case "dream":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <Lesson text={day.lesson} />
          <View style={{ marginTop: 14, marginBottom: 4 }}>
            <Text style={{ fontSize: 10.5, lineHeight: 1.4 }}>1. {day.steps[0]}</Text>
          </View>
          <Lines />
        </Sheet>
      );
    case "honest": {
      const which = ctx.c.days.filter((d) => d.kind === "honest" && d.day <= day.day).length;
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <Exit />
          <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 15 }}>{day.title}</Text>
          <Text style={{ fontSize: 10.5, lineHeight: 1.5, marginTop: 8 }}>{day.lesson}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 6 }}>
            {[1, 2, 3, 4].map((k) => (
              <View key={k} style={{ width: 22, height: 3, borderRadius: 2, marginRight: 4, backgroundColor: k <= which ? SOFT : "#DDDDDD" }} />
            ))}
            <Small style={{ marginLeft: 6 }}>15–20 minutes</Small>
          </View>
          <Lines />
        </Sheet>
      );
    }
    case "letter":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <Text style={{ fontStyle: "italic", fontSize: 10, lineHeight: 1.5, color: SOFT }}>{day.lesson}</Text>
          <Text style={{ fontSize: 17, fontStyle: "italic", marginTop: 18, marginBottom: 10 }}>{day.title}</Text>
          <Lines gap={26} />
        </Sheet>
      );
    case "retake":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <Text style={{ fontStyle: "italic", fontSize: 9.5, lineHeight: 1.45, color: SOFT, marginBottom: 8 }}>{day.lesson}</Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 3 }}>
            <Small style={{ fontSize: 7 }}>not like me</Small>
            {[1, 2, 3, 4, 5].map((k) => (
              <Text key={k} style={{ fontFamily: SIGN, fontSize: 7.5, color: SOFT, width: 13, textAlign: "center" }}>{k}</Text>
            ))}
            <Small style={{ fontSize: 7, marginLeft: 4, marginRight: 0 }}>very like me</Small>
          </View>
          {ctx.c.retake.map((r, i) => (
            <View key={r.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4.2, borderBottomWidth: 0.5, borderColor: "#DDDDDD" }}>
              <Text style={{ fontSize: 9, flexGrow: 1, flexBasis: 0, paddingRight: 6 }}>
                {i + 1}. {r.statement}
              </Text>
              <View style={{ flexDirection: "row", marginRight: 43 }}>
                {[1, 2, 3, 4, 5].map((k) => (
                  <View key={k} style={{ width: 13, alignItems: "center" }}>
                    <Dot size={7.5} />
                  </View>
                ))}
              </View>
            </View>
          ))}
          <View style={{ marginTop: "auto" }}>
            <UpsideDown title={day.day === 90 ? "Your answers on the climb (day 45 is on page " + ctx.retakePage + ")" : "Your answers on the climb"}>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {ctx.c.retake.map((r, i) => (
                  <Text key={r.id} style={{ fontFamily: SIGN, fontSize: 9, width: "20%", marginBottom: 2 }}>
                    {i + 1}.  {r.original}
                  </Text>
                ))}
              </View>
            </UpsideDown>
          </View>
        </Sheet>
      );
    case "savor":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <Lesson text={day.lesson} />
          <Tonight text={day.prompt} label="Today" />
          <Lines />
        </Sheet>
      );
    case "bestself":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <Text style={{ fontSize: 10.5, lineHeight: 1.5 }}>{day.lesson}</Text>
          <View style={{ height: 8 }} />
          <Lines />
        </Sheet>
      );
    case "strength":
    case "practice":
    default:
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <DayHead day={day} />
          <Lesson text={day.lesson} />
          <Plan day={day} />
          <Tonight text={day.prompt} />
          <Lines />
        </Sheet>
      );
  }
}

function dayRight(day: JournalDay, ctx: Ctx): PageSpec {
  const { c } = ctx;
  const note = c.notes.find((x) => x.onDay === day.day && x.text);
  const ground = day.day <= 30;
  const quiet = day.kind === "question" || day.kind === "rest";
  const label = `Day ${day.day}`;

  const footer = (
    <View>
      {note && (
        <UpsideDown title={`From Ember. Read this on day ${note.readOn}.`}>
          <Text style={{ fontStyle: "italic", fontSize: 9.5, lineHeight: 1.45 }}>{note.text}</Text>
        </UpsideDown>
      )}
      {!quiet && (
        <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 0.6, borderColor: RULE }}>
          {ground && c.pattern ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Small style={{ marginRight: 6 }}>Caught myself {c.pattern}:</Small>
              {Array.from({ length: 8 }).map((_, i) => (
                <Dot key={i} size={7} square />
              ))}
            </View>
          ) : null}
          <Small>One word for today: _______________</Small>
        </View>
      )}
    </View>
  );

  switch (day.kind) {
    case "question":
    case "rest":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <View style={{ flexGrow: 1 }} />
          {footer}
        </Sheet>
      );
    case "mirror":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <Tonight text={day.prompt} label="Then" />
          <Lines />
          {footer}
        </Sheet>
      );
    case "dream":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <Text style={{ fontSize: 10.5, lineHeight: 1.4 }}>2. {day.steps[1]}</Text>
          <FewLines count={4} />
          <Text style={{ fontSize: 10.5, lineHeight: 1.4, marginTop: 12 }}>3. {day.steps[2]}</Text>
          <Lines />
          <Tonight text={day.prompt} label="Last" />
          <FewLines count={3} />
          {footer}
        </Sheet>
      );
    case "honest":
    case "bestself":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <Lines />
          <Tonight text={day.prompt} label="When you're done" />
          <FewLines count={3} />
          {footer}
        </Sheet>
      );
    case "letter":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <Lines gap={26} />
          <Text style={{ fontStyle: "italic", fontSize: 9, color: FAINT, textAlign: "right", marginTop: 6 }}>Unsent.</Text>
          {footer}
        </Sheet>
      );
    case "wild":
    case "retake":
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <Tonight text={day.prompt} label={day.kind === "wild" ? "Tonight" : "Then"} />
          <Lines />
          {footer}
        </Sheet>
      );
    default:
      return (n) => (
        <Sheet key={n} n={n} label={label}>
          <Lines />
          {footer}
        </Sheet>
      );
  }
}

function checkinLeft(c: JournalContent, w: number): PageSpec {
  const week = c.weeks[w];
  return (n) => (
    <Sheet key={n} n={n} label={PHASES[Math.floor(w / 4)].name}>
      <Text style={{ fontFamily: SIGN, fontSize: 9, color: SOFT }}>
        Week {week.n} of 12 · {week.theme}
      </Text>
      <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 18, marginTop: 2 }}>Check-in</Text>
      <Text style={{ fontStyle: "italic", fontSize: 11, lineHeight: 1.5, marginTop: 12 }}>{week.checkin}</Text>
      <View style={{ height: 6 }} />
      <Lines gap={22} />
    </Sheet>
  );
}

function checkinRight(w: number): PageSpec {
  const block = (label: string, lines: number) => (
    <View style={{ marginBottom: 14 }}>
      <Label>{label}</Label>
      <FewLines count={lines} />
    </View>
  );
  return (n) => (
    <Sheet key={n} n={n} label={PHASES[Math.floor(w / 4)].name}>
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
          <Small> light</Small>
        </View>
      </View>
    </Sheet>
  );
}

// ─── Front and back pages ─────────────────────────────────────────────────────

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
          This journal was written for {c.firstName} by Ember, the guide inside Sonder, from {c.firstName}&rsquo;s Sonder Report and the
          answers {c.firstName} shared. It was printed as a single copy.
        </Text>
        <Text style={{ fontSize: 8, lineHeight: 1.6, color: SOFT, marginTop: 8 }}>
          Sonder is a tool for reflection. It is not therapy, a diagnosis, or a substitute for professional care. If you are in crisis in
          the US, call or text 988, any time.
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

const blankPage: PageSpec = (n) => <Sheet key={n} n={n} folio={false} />;

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
        What your climb showed, and what you said you wanted. Come back here when you lose the trail.
      </Text>
      {c.words.length > 0 && (
        <View style={{ marginTop: 16, paddingVertical: 10, borderTopWidth: 0.6, borderBottomWidth: 0.6, borderColor: RULE }}>
          <Label>Your four stones</Label>
          <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 13.5 }}>{c.words.join("  ·  ")}</Text>
        </View>
      )}
      {c.hope ? (
        <View style={{ marginTop: 14 }}>
          <Label>In your own words, before you began</Label>
          <Text style={{ fontStyle: "italic", fontSize: 11, lineHeight: 1.5 }}>&ldquo;{c.hope}&rdquo;</Text>
        </View>
      ) : null}
      <View style={{ marginTop: 14 }}>
        {c.carry.slice(0, c.hope ? 5 : 7).map((l, i) => (
          <View key={i} style={{ marginBottom: 9 }}>
            <Label>{l.title}</Label>
            <Text style={{ fontSize: 10, lineHeight: 1.45 }}>{l.line}</Text>
          </View>
        ))}
      </View>
    </Sheet>
  );
}

const howToPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 18, marginBottom: 14 }}>How this book works</Text>
    {[
      ["One spread a day", "Every day is two facing pages. Read the left page in the morning; write on the right one at night."],
      ["Three stretches", "Ground (days 1–30) is for noticing. Climb (31–60) is for meeting what you usually hide. Return (61–90) is for coming home whole."],
      ["Every seventh day", "A check-in. Look back over the week and notice what's shifting."],
      ["Upside-down pages", "Now and then something is printed upside down. Leave it until the day it names."],
      ["The ninety squares", "Each night, fill one square. By day 90 you'll see your whole season."],
      ["If you miss a day", "Pick up where you are. Missed days are part of the trail, not a failure of it."],
    ].map(([h, b]) => (
      <View key={h} style={{ marginBottom: 11 }}>
        <Label>{h}</Label>
        <Text style={{ fontSize: 10.3, lineHeight: 1.5 }}>{b}</Text>
      </View>
    ))}
    <View style={{ marginTop: "auto", paddingTop: 10, borderTopWidth: 0.6, borderColor: RULE }}>
      <Text style={{ fontSize: 8.5, lineHeight: 1.5, color: SOFT }}>
        If things ever feel too heavy, put the book down and talk to someone you trust. In the US you can call or text 988, any time.
      </Text>
    </View>
  </Sheet>
);

const KIND_ORDER: DayKind[] = ["practice", "question", "mirror", "dream", "honest", "letter", "wild", "strength", "savor", "bestself", "retake", "rest"];

const legendPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Twelve kinds of day</Text>
    <Text style={{ fontSize: 9.5, color: SOFT, marginBottom: 12 }}>Each has its own mark in the corner of the page.</Text>
    {KIND_ORDER.map((k) => (
      <View key={k} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8.5 }}>
        <View style={{ width: 20, paddingTop: 1 }}>
          <Icon kind={k} size={12} />
        </View>
        <View style={{ flexGrow: 1, flexBasis: 0 }}>
          <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 9.5 }}>{KIND_LABEL[k]}</Text>
          <Text style={{ fontSize: 9, lineHeight: 1.4, color: SOFT }}>{KIND_BLURB[k]}</Text>
        </View>
      </View>
    ))}
  </Sheet>
);

const gridPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 18 }}>Ninety squares</Text>
    <Text style={{ fontSize: 9.5, color: SOFT, marginTop: 6, marginBottom: 14, lineHeight: 1.5 }}>
      Each night, fill one square: a word, a mark, a shade of pencil for how the day felt. By day 90, your season will be here in one
      picture.
    </Text>
    {Array.from({ length: 10 }).map((_, r) => (
      <View key={r} style={{ flexDirection: "row", marginBottom: 4 }}>
        {Array.from({ length: 9 }).map((_, col) => {
          const d = r * 9 + col + 1;
          return (
            <View key={col} style={{ width: 33, height: 33, borderWidth: 0.6, borderColor: RULE, marginRight: 3.5, padding: 2 }}>
              <Text style={{ fontFamily: SIGN, fontSize: 5.5, color: FAINT }}>{d}</Text>
            </View>
          );
        })}
      </View>
    ))}
    <View style={{ flexDirection: "row", marginTop: 8 }}>
      {PHASES.map((p) => (
        <Small key={p.name}>
          {p.name}: {p.first}–{p.first + 29}
        </Small>
      ))}
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
      <Lines gap={26} />
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

const keepingPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 16 }}>What I&rsquo;m keeping</Text>
    <Text style={{ fontStyle: "italic", fontSize: 10, color: SOFT, marginTop: 6, marginBottom: 12 }}>The practices, words, and people that are coming with you.</Text>
    <Lines />
  </Sheet>
);

function openWhenPage(o: { when: string; letter: string }): PageSpec {
  return (n) => (
    <Sheet key={n} n={n} label="Open when">
      <Text style={{ fontFamily: SIGN, fontSize: 9, color: SOFT }}>Open when</Text>
      <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 16, marginTop: 2, marginBottom: 14 }}>
        {o.when.replace(/^When /, "").replace(/^./, (ch) => ch.toUpperCase())}
      </Text>
      <Paragraphs text={o.letter} size={10.5} />
      <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 9.5, color: SOFT, marginBottom: 14 }}>Ember</Text>
      <Lines />
    </Sheet>
  );
}

// The research behind each practice. Every source here must be re-checked before launch.
const SOURCES: [string, string][] = [
  ["The practice days", "\"When–then\" plans: Gollwitzer & Sheeran (2006), Advances in Experimental Social Psychology. Tracking your own progress: Harkin et al. (2016), Psychological Bulletin. How long habits take: Lally et al. (2010), European Journal of Social Psychology."],
  ["Four honest days", "Expressive writing: Pennebaker & Beall (1986), Journal of Abnormal Psychology; Frattaroli (2006), Psychological Bulletin."],
  ["Strengths, three good things, unsent letters", "Seligman, Steen, Park & Peterson (2005), American Psychologist."],
  ["Your best possible self", "King (2001), Personality and Social Psychology Bulletin. Naming what gets in the way: Oettingen, Rethinking Positive Thinking (2014)."],
  ["Savoring", "Bryant & Veroff, Savoring (2007)."],
  ["Kindness inward", "Neff (2003), Self and Identity."],
  ["Stepping back from thoughts, acting from values", "Hayes, Strosahl & Wilson, Acceptance and Commitment Therapy (2012)."],
  ["Wild cards", "Awe walks: Sturm et al. (2022), Emotion."],
  ["Work that fits", "Job crafting: Wrzesniewski & Dutton (2001), Academy of Management Review."],
  ["The shape of the book", "The three stretches follow the oldest story there is: leaving, the hard middle, coming home. Joseph Campbell, The Hero with a Thousand Faces (1949). The mask, the parts we hide, and becoming whole come from Carl Jung; the mirror and dream pages draw on his ideas of projection and active imagination. Jung's ideas are a lens, not proven science."],
];

const sourcesPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Where these practices come from</Text>
    <Text style={{ fontSize: 9, color: SOFT, marginBottom: 12, lineHeight: 1.45 }}>
      Every practice in this book has roots in research or in a long tradition of reflection. Here is where to read more.
    </Text>
    {SOURCES.map(([h, b]) => (
      <View key={h} style={{ marginBottom: 7.5 }}>
        <Text style={{ fontFamily: SIGN, fontWeight: 600, fontSize: 8.8 }}>{h}</Text>
        <Text style={{ fontSize: 8.2, lineHeight: 1.4, color: SOFT }}>{b}</Text>
      </View>
    ))}
  </Sheet>
);

function readingPage(c: JournalContent): PageSpec {
  return (n) => (
    <Sheet key={n} n={n}>
      <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>For the trail ahead</Text>
      <Text style={{ fontSize: 9.5, color: SOFT, marginBottom: 16 }}>The books from your report, for when you want company.</Text>
      {c.books.map((b) => (
        <View key={b.title} style={{ marginBottom: 12 }}>
          <Text style={{ fontStyle: "italic", fontSize: 12 }}>{b.title}</Text>
          <Text style={{ fontFamily: SIGN, fontSize: 9, color: SOFT, marginTop: 2 }}>{b.author}</Text>
        </View>
      ))}
      <View style={{ marginTop: 18 }}>
        <Label>Books I found along the way</Label>
        <FewLines count={6} />
      </View>
    </Sheet>
  );
}

const supportPage: PageSpec = (n) => (
  <Sheet key={n} n={n}>
    <View style={{ flexGrow: 1, justifyContent: "center" }}>
      <Text style={{ fontFamily: SIGN, fontWeight: 700, fontSize: 16 }}>If things get heavy</Text>
      <Text style={{ fontSize: 10.5, lineHeight: 1.55, marginTop: 10 }}>
        This journal is for reflection, not for carrying everything alone. If you&rsquo;re struggling, talk to someone you trust, or to a
        professional.
      </Text>
      <Text style={{ fontSize: 10.5, lineHeight: 1.55, marginTop: 8 }}>
        In the US, you can call or text 988 any time to reach the Suicide &amp; Crisis Lifeline. Outside the US, findahelpline.com lists
        free, confidential support near you.
      </Text>
    </View>
  </Sheet>
);

const notesPage: PageSpec = (n) => (
  <Sheet key={n} n={n} label="Notes">
    <Lines />
  </Sheet>
);

// ─── Assembly ─────────────────────────────────────────────────────────────────

export function journalPages(c: JournalContent): PageSpec[] {
  const pages: PageSpec[] = [];
  const add = (...p: PageSpec[]) => pages.push(...p);
  // Page numbers are 1-based; the day-45 retake's left page is found after layout.
  const ctx: Ctx = { c, retakePage: 0 };

  add(titlePage(c), colophonPage(c), dedicationPage(c), c.care ? supportPage : blankPage); // 1–4
  add(letterPage("Before you begin", c.opening), mapPage(c), howToPage, legendPage, gridPage); // 5–9
  add(
    writeLetterPage("A letter to day 90", "Write to the person you'll be at the end of these ninety days. What do you hope they know? What do you want them to remember about today?"),
    writeLetterPage("", "", true)
  ); // 10–11

  PHASES.forEach((_, i) => {
    add(phaseTitlePage(i), phaseLetterPage(c, i));
    c.days
      .filter((d) => phaseOf(d.day) === i)
      .forEach((d) => {
        if (d.kind === "retake" && d.day === 45) ctx.retakePage = pages.length + 1;
        add(dayLeft(d, ctx), dayRight(d, ctx));
        const w = CHECKIN_AFTER.indexOf(d.day);
        if (w >= 0 && c.weeks[w]) add(checkinLeft(c, w), checkinRight(w));
      });
  });

  add(
    writeLetterPage("A letter back to day 1", "Write back to the person who opened this book. What would you tell them now?"),
    writeLetterPage("", "", true),
    letterPage("After day 90", c.closing),
    keepingPage,
    ...c.openWhen.filter((o) => o.letter).map(openWhenPage),
    sourcesPage,
    readingPage(c),
    supportPage
  );
  while (pages.length % 4 !== 0) add(notesPage);
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
            Ninety days written for {c.firstName} from their Sonder Report: practices, questions, letters, wild cards, and a guide on
            every page. Noticing, then climbing, then coming home.
          </Text>
        </View>
        <Text style={{ position: "absolute", left: BLEED + safe, bottom: BLEED + safe, fontFamily: SIGN, fontWeight: 600, fontSize: 10, color: "#F6F8F7" }}>
          Sonder · Come inward.
        </Text>
      </Page>
    </Document>
  );
}
