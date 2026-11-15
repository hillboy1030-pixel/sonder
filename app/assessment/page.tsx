"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Flag,
  Keyboard,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { SECTIONS } from "@/lib/questions";
import { calculateScores } from "@/lib/scoring";
import { CHAPTERS, trailMarkerFor, type ChapterId } from "@/lib/chapters";
import { INTAKE_STEPS, joinClarityGoals, type IntakeStep } from "@/lib/intake";
import { KEYS, remove, writeJSON } from "@/lib/storage";
import { useStored } from "@/lib/useStored";
import { Logo } from "@/components/Logo";
import { MountainScene } from "@/components/MountainScene";
import { TrailProgress } from "@/components/TrailProgress";
import { ChapterIcon } from "@/components/ChapterIcon";
import { SupportNote } from "@/components/SupportNote";
import { GuideLine } from "@/components/Guide";
import { GUIDE } from "@/lib/guide";
import { mentionsCrisis } from "@/lib/safety";

// ─── State ────────────────────────────────────────────────────────────────────

type Phase = "welcome" | "intake" | "intro" | "question" | "marker";

type Progress = {
  phase: Phase;
  intakeIndex: number;
  /** Index into CHAPTERS (1–4 are the question chapters). */
  chapter: number;
  qIndex: number;
  answers: Record<number, number>;
  /** Raw intake answers. Multi-select values are joined with "|". */
  context: Record<string, string>;
};

const START: Progress = { phase: "welcome", intakeIndex: 0, chapter: 1, qIndex: 0, answers: {}, context: {} };

const MINUTES: Record<ChapterId, number> = { basecamp: 3, terrain: 3, path: 2, company: 2, carry: 2 };
const FRAMEWORK: Record<ChapterId, string> = {
  basecamp: "Sonder's own questions",
  terrain: "From the Mini-IPIP, a published short form of the Big Five",
  path: "Based on Holland's work-interest types (as used by O*NET)",
  company: "Adapted from the ECR relationship scales",
  carry: "Adapted from the VIA character strengths",
};

const ADVANCE_DELAY = 260;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter();
  const [p, setP] = useState<Progress>(START);
  const stored = useStored<Progress>(KEYS.progress);
  const [dismissed, setDismissed] = useState(false);
  const loaded = stored !== undefined;
  const saved = !dismissed && stored && stored.phase !== "welcome" ? stored : null;
  const [pending, setPending] = useState<number | null>(null);
  const advancing = useRef(false);

  // Save after every step so a closed tab doesn't lose the climb.
  useEffect(() => {
    if (p.phase !== "welcome") writeJSON(KEYS.progress, p);
  }, [p]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [p.phase, p.intakeIndex, p.chapter]);

  const chapter = CHAPTERS[p.phase === "intake" || p.phase === "welcome" ? 0 : p.chapter];
  const section = chapter.sectionIndex !== null ? SECTIONS[chapter.sectionIndex] : null;

  const finish = useCallback(
    (prog: Progress) => {
      const scores = calculateScores(prog.answers);
      const ctx: Record<string, string> = { ...prog.context };
      ctx.clarityGoal = joinClarityGoals((prog.context.clarityGoal ?? "").split("|").filter(Boolean));
      const markers = CHAPTERS.slice(1)
        .map((c) => ({ chapter: c.id, ...trailMarkerFor(c.id, scores) }))
        .filter((m) => m.headline);
      writeJSON(KEYS.scores, scores);
      writeJSON(KEYS.context, ctx);
      writeJSON(KEYS.markers, markers);
      remove(KEYS.preview, KEYS.report, KEYS.session, KEYS.progress);
      router.push("/preview");
    },
    [router]
  );

  // ── Navigation ──────────────────────────────────────────────────────────────

  const next = useCallback(() => {
    setP((cur) => {
      if (cur.phase === "intake") {
        return cur.intakeIndex < INTAKE_STEPS.length - 1
          ? { ...cur, intakeIndex: cur.intakeIndex + 1 }
          : { ...cur, phase: "intro", chapter: 1, qIndex: 0 };
      }
      if (cur.phase === "intro") return { ...cur, phase: "question", qIndex: 0 };
      if (cur.phase === "question") {
        const n = SECTIONS[CHAPTERS[cur.chapter].sectionIndex!].questions.length;
        return cur.qIndex < n - 1 ? { ...cur, qIndex: cur.qIndex + 1 } : { ...cur, phase: "marker" };
      }
      if (cur.phase === "marker" && cur.chapter < CHAPTERS.length - 1) {
        return { ...cur, phase: "intro", chapter: cur.chapter + 1, qIndex: 0 };
      }
      return cur;
    });
  }, []);

  const back = useCallback(() => {
    setPending(null);
    setP((cur) => {
      switch (cur.phase) {
        case "intake":
          return cur.intakeIndex > 0 ? { ...cur, intakeIndex: cur.intakeIndex - 1 } : { ...cur, phase: "welcome" };
        case "intro":
          if (cur.chapter === 1) return { ...cur, phase: "intake", intakeIndex: INTAKE_STEPS.length - 1 };
          return {
            ...cur,
            phase: "question",
            chapter: cur.chapter - 1,
            qIndex: SECTIONS[CHAPTERS[cur.chapter - 1].sectionIndex!].questions.length - 1,
          };
        case "question":
          return cur.qIndex > 0 ? { ...cur, qIndex: cur.qIndex - 1 } : { ...cur, phase: "intro" };
        case "marker":
          return { ...cur, phase: "question" };
        default:
          return cur;
      }
    });
  }, []);

  const answerQuestion = useCallback(
    (value: number) => {
      if (advancing.current || p.phase !== "question" || !section) return;
      const q = section.questions[p.qIndex];
      advancing.current = true;
      setPending(value);
      setP((cur) => ({ ...cur, answers: { ...cur.answers, [q.id]: value } }));
      window.setTimeout(() => {
        setPending(null);
        advancing.current = false;
        next();
      }, ADVANCE_DELAY);
    },
    [p.phase, p.qIndex, section, next]
  );

  const setContext = useCallback((key: string, value: string) => {
    setP((cur) => ({ ...cur, context: { ...cur.context, [key]: value } }));
  }, []);

  const chooseSingle = useCallback(
    (key: string, value: string) => {
      if (advancing.current) return;
      advancing.current = true;
      setContext(key, value);
      window.setTimeout(() => {
        advancing.current = false;
        next();
      }, ADVANCE_DELAY);
    },
    [setContext, next]
  );

  // Number keys answer, Backspace/left arrow goes back.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (p.phase === "question" && n >= 1 && n <= 5) {
        e.preventDefault();
        answerQuestion(n);
      } else if (p.phase === "intake") {
        const step = INTAKE_STEPS[p.intakeIndex];
        if (step.kind === "single" && step.options && n >= 1 && n <= step.options.length) {
          e.preventDefault();
          chooseSingle(step.key, step.options[n - 1]);
        }
      }
      if ((e.key === "ArrowLeft" || e.key === "Backspace") && p.phase !== "welcome") {
        e.preventDefault();
        back();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [p.phase, p.intakeIndex, answerQuestion, chooseSingle, back]);

  // ── Progress numbers for the trail ─────────────────────────────────────────

  let trailChapter = 0;
  let fraction = 0;
  if (p.phase === "intake") {
    fraction = p.intakeIndex / INTAKE_STEPS.length;
  } else if (p.phase !== "welcome") {
    trailChapter = p.chapter;
    const n = section?.questions.length ?? 1;
    fraction = p.phase === "intro" ? 0 : p.phase === "marker" ? 1 : p.qIndex / n;
    if (p.phase === "marker") {
      trailChapter = p.chapter + 1;
      fraction = 0;
    }
  }

  const stepKey = `${p.phase}-${p.intakeIndex}-${p.chapter}-${p.qIndex}`;

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-mist">
      <MountainScene quiet className="pointer-events-none fixed inset-x-0 bottom-0 h-[30vh] w-full sm:h-[36vh]" />

      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-5 pt-5 sm:px-6">
        <Logo />
        {p.phase !== "welcome" && (
          <p className="flex items-center gap-1.5 font-sign text-sm text-stone">
            <Check size={15} aria-hidden="true" />
            Saved as you go
          </p>
        )}
      </header>

      {p.phase !== "welcome" && (
        <div className="relative z-10 mx-auto mt-5 w-full max-w-3xl px-3 sm:px-6">
          <TrailProgress chapter={trailChapter} fraction={fraction} />
        </div>
      )}

      <main className="relative z-10 flex flex-1 items-start justify-center px-4 pb-[22vh] pt-6 sm:items-center sm:pb-[26vh] sm:pt-8">
        <div key={stepKey} className="glass w-full max-w-2xl rounded-panel p-6 animate-rise sm:p-10">
          {!loaded ? (
            <div className="h-64" />
          ) : p.phase === "welcome" ? (
            <Welcome
              saved={saved}
              onResume={() => saved && setP(saved)}
              onReset={() => {
                remove(KEYS.progress);
                setDismissed(true);
              }}
              onStart={() => {
                remove(KEYS.progress);
                setDismissed(true);
                setP({ ...START, phase: "intake" });
              }}
            />
          ) : p.phase === "intake" ? (
            <IntakeCard
              step={INTAKE_STEPS[p.intakeIndex]}
              index={p.intakeIndex}
              value={p.context[INTAKE_STEPS[p.intakeIndex].key] ?? ""}
              onChange={(v) => setContext(INTAKE_STEPS[p.intakeIndex].key, v)}
              onChoose={(v) => chooseSingle(INTAKE_STEPS[p.intakeIndex].key, v)}
              onNext={next}
              onBack={back}
            />
          ) : p.phase === "intro" ? (
            <ChapterIntro chapterIndex={p.chapter} onStart={next} onBack={back} />
          ) : p.phase === "question" && section ? (
            <QuestionCard
              text={section.questions[p.qIndex].text}
              ask={section.ask}
              labels={section.scaleLabels}
              number={p.qIndex + 1}
              total={section.questions.length}
              topic={chapter.topic}
              value={pending ?? p.answers[section.questions[p.qIndex].id]}
              onAnswer={answerQuestion}
              onBack={back}
            />
          ) : p.phase === "marker" ? (
            <MarkerCard
              chapterIndex={p.chapter}
              answers={p.answers}
              onContinue={() => (p.chapter < CHAPTERS.length - 1 ? next() : finish(p))}
              onBack={back}
            />
          ) : null}
        </div>
      </main>

      {process.env.NODE_ENV === "development" && <DevFill onFill={finish} />}
    </div>
  );
}

// ─── Welcome ──────────────────────────────────────────────────────────────────

function Welcome({
  saved,
  onResume,
  onReset,
  onStart,
}: {
  saved: Progress | null;
  onResume: () => void;
  onReset: () => void;
  onStart: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const total = Object.values(MINUTES).reduce((a, b) => a + b, 0);

  if (saved) {
    const where =
      saved.phase === "intake" ? "Basecamp" : CHAPTERS[saved.chapter]?.name ?? "the trail";
    return (
      <div>
        <h1 className="type-h1 text-ink">Welcome back.</h1>
        <GuideLine className="mt-6">{GUIDE.welcomeBack}</GuideLine>
        <p className="mt-5 font-sign text-[0.98rem] text-slate">
          You stopped at <span className="font-semibold text-ink">{where}</span>. Your answers are still here, in this browser.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button onClick={onResume} className="btn btn-primary">
            Pick up where you left off
            <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
          </button>
          <button onClick={onReset} className="btn btn-secondary">
            <RotateCcw size={17} aria-hidden="true" />
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="type-h1 text-ink">Your climb has five stages.</h1>
      <GuideLine className="mt-6">{GUIDE.welcome}</GuideLine>
      <p className="mt-5 font-sign text-[0.98rem] text-slate">
        About {total} minutes. Your progress saves as you go, so you can stop and come back.
      </p>

      <ol className="mt-7 space-y-1">
        {CHAPTERS.map((c, i) => (
          <li key={c.id} className="flex items-center gap-4 rounded-xl px-1 py-1.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine/10 text-pine">
              <ChapterIcon id={c.id} size={19} strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-sign text-[1.05rem] font-semibold text-ink">{c.name}</span>
              <span className="block font-sign text-[0.95rem] text-stone">{c.topic}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 font-sign text-sm text-stone">
              <Clock size={14} aria-hidden="true" />
              {MINUTES[c.id]} min
            </span>
            <span className="sr-only">Stage {i + 1}</span>
          </li>
        ))}
      </ol>

      <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-[14px] border border-line bg-snow/60 p-4 transition-colors hover:border-pine/40">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#213F35]"
        />
        <span className="font-read text-[0.98rem] leading-relaxed text-slate">
          I&rsquo;m 18 or older. I understand Sonder is for self-reflection and isn&rsquo;t a diagnosis
          or a substitute for professional care.
        </span>
      </label>

      <div className="mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-sign text-sm text-stone">
          <ShieldCheck size={16} aria-hidden="true" />
          Answers stay in your browser
        </p>
        <button onClick={onStart} disabled={!agreed} className="btn btn-primary w-full sm:w-auto">
          Start at basecamp
          <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ─── Basecamp (intake) ────────────────────────────────────────────────────────

function IntakeCard({
  step,
  index,
  value,
  onChange,
  onChoose,
  onNext,
  onBack,
}: {
  step: IntakeStep;
  index: number;
  value: string;
  onChange: (v: string) => void;
  onChoose: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const selected = step.kind === "multi" ? value.split("|").filter(Boolean) : [];
  const canContinue = !step.required || (step.kind === "multi" ? selected.length > 0 : value.trim() !== "");
  const [showSupport, setShowSupport] = useState(false);
  const isText = step.kind === "text" || step.kind === "longtext";
  const proceed = () => {
    if (isText && !showSupport && mentionsCrisis(value)) {
      setShowSupport(true);
      return;
    }
    onNext();
  };
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if ((step.kind === "text" || step.kind === "longtext") && window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, [step.kind]);

  return (
    <div>
      <CardMeta
        left={
          <>
            <ChapterIcon id="basecamp" size={16} />
            Basecamp
          </>
        }
        right={`${index + 1} of ${INTAKE_STEPS.length}`}
      />
      {index === 0 && (
        <GuideLine size="sm" className="mt-5">
          {GUIDE.chapterIntro.basecamp}
        </GuideLine>
      )}
      <h1 className="type-h2 mt-4 text-ink">
        {step.prompt}
        {step.required && <span className="sr-only"> (required)</span>}
      </h1>
      {step.help && <p className="mt-3 font-read text-[1.02rem] text-slate">{step.help}</p>}

      <div className="mt-7">
        {step.kind === "single" && (
          <fieldset>
            <legend className="sr-only">{step.prompt}</legend>
            <div className="flex flex-col gap-2.5">
              {step.options!.map((opt, i) => (
                <Choice key={opt} keyHint={i + 1} label={opt} selected={value === opt} onClick={() => onChoose(opt)} />
              ))}
            </div>
          </fieldset>
        )}

        {step.kind === "multi" && (
          <fieldset>
            <legend className="sr-only">{step.prompt}</legend>
            <div className={`grid gap-2.5 ${step.options!.length > 4 ? "sm:grid-cols-2" : ""}`}>
              {step.options!.map((opt) => {
                const on = selected.includes(opt);
                const full = !!step.maxPicks && selected.length >= step.maxPicks && !on;
                return (
                  <Choice
                    key={opt}
                    label={opt}
                    multi
                    selected={on}
                    disabled={full}
                    onClick={() =>
                      onChange((on ? selected.filter((s) => s !== opt) : [...selected, opt]).join("|"))
                    }
                  />
                );
              })}
            </div>
          </fieldset>
        )}

        {(step.kind === "text" || step.kind === "longtext") && (
          <div>
            <label htmlFor={`intake-${step.key}`} className="sr-only">
              {step.prompt}
            </label>
            {step.kind === "text" ? (
              <input
                ref={inputRef}
                id={`intake-${step.key}`}
                type="text"
                value={value}
                maxLength={step.maxLength}
                placeholder={step.placeholder}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canContinue && proceed()}
                className="w-full rounded-[14px] border border-line bg-snow/80 px-4 py-3.5 font-read text-lg text-ink outline-none transition-colors placeholder:text-stone/70 focus:border-pine focus:bg-snow"
              />
            ) : (
              <textarea
                ref={inputRef}
                id={`intake-${step.key}`}
                value={value}
                rows={3}
                maxLength={step.maxLength}
                placeholder={step.placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full resize-none rounded-[14px] border border-line bg-snow/80 px-4 py-3.5 font-read text-lg leading-relaxed text-ink outline-none transition-colors placeholder:text-stone/70 focus:border-pine focus:bg-snow"
              />
            )}
            {showSupport && (
              <div className="mt-5">
                <SupportNote onContinue={onNext} />
              </div>
            )}
            {step.maxLength && value.length > step.maxLength * 0.7 && (
              <p className="mt-1.5 text-right font-sign text-xs text-stone">
                {value.length} / {step.maxLength}
              </p>
            )}
          </div>
        )}
      </div>

      <CardFooter onBack={onBack} hint={step.kind === "single" ? "keys" : undefined}>
        {step.kind !== "single" ? (
          <div className="flex items-center gap-2">
            {!step.required && !value && (
              <button onClick={onNext} className="btn btn-quiet btn-sm">
                Skip
              </button>
            )}
            <button onClick={proceed} disabled={!canContinue} className="btn btn-dark btn-sm">
              Continue
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        ) : !step.required ? (
          <button onClick={onNext} className="btn btn-quiet btn-sm">
            {value ? "Continue" : "Skip"}
          </button>
        ) : null}
      </CardFooter>
    </div>
  );
}

// ─── Chapter intro ────────────────────────────────────────────────────────────

function ChapterIntro({ chapterIndex, onStart, onBack }: { chapterIndex: number; onStart: () => void; onBack: () => void }) {
  const c = CHAPTERS[chapterIndex];
  const count = SECTIONS[c.sectionIndex!].questions.length;
  return (
    <div>
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pine text-gold-hi animate-pop">
          <ChapterIcon id={c.id} size={26} strokeWidth={1.9} />
        </span>
        <p className="type-kicker">
          Chapter {chapterIndex} of {CHAPTERS.length - 1}
        </p>
      </div>
      <h1 className="type-h1 mt-6 text-ink">{c.name}</h1>
      <p className="mt-2 font-sign text-lg font-medium text-pine-2">{c.topic}</p>
      <GuideLine className="mt-6">{GUIDE.chapterIntro[c.id]}</GuideLine>
      <p className="mt-5 font-read text-[1.05rem] text-slate">{c.intro}</p>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-sign text-[0.95rem] text-stone">
        <li className="flex items-center gap-1.5">
          <Clock size={15} aria-hidden="true" />
          About {MINUTES[c.id]} minutes
        </li>
        <li className="flex items-center gap-1.5">
          <Check size={15} aria-hidden="true" />
          {count} statements
        </li>
        <li className="flex items-center gap-1.5">
          <Keyboard size={15} aria-hidden="true" />
          Tap or press 1–5
        </li>
      </ul>

      <CardFooter onBack={onBack} note={FRAMEWORK[c.id]}>
        <button onClick={onStart} className="btn btn-primary" autoFocus>
          {chapterIndex === 1 ? "Begin the climb" : "Start this chapter"}
          <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
      </CardFooter>
    </div>
  );
}

// ─── Question ─────────────────────────────────────────────────────────────────

function QuestionCard({
  text,
  ask,
  labels,
  number,
  total,
  topic,
  value,
  onAnswer,
  onBack,
}: {
  text: string;
  ask: string;
  labels: string[];
  number: number;
  total: number;
  topic: string;
  value: number | undefined;
  onAnswer: (v: number) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <CardMeta left={topic} right={`${number} of ${total}`} />
      <p className="mt-6 font-read text-[clamp(1.55rem,3.6vw,2.15rem)] font-medium leading-[1.25] text-ink">{text}</p>
      <fieldset className="mt-7">
        <legend className="mb-3 font-sign text-[0.95rem] text-stone">{ask}</legend>
        <div className="flex flex-col gap-2">
          {labels.map((label, i) => (
            <Choice key={label} keyHint={i + 1} label={label} selected={value === i + 1} onClick={() => onAnswer(i + 1)} scale={i} />
          ))}
        </div>
      </fieldset>
      <CardFooter onBack={onBack} hint="keys" />
    </div>
  );
}

// ─── Trail marker (end of chapter) ────────────────────────────────────────────

function MarkerCard({
  chapterIndex,
  answers,
  onContinue,
  onBack,
}: {
  chapterIndex: number;
  answers: Record<number, number>;
  onContinue: () => void;
  onBack: () => void;
}) {
  const c = CHAPTERS[chapterIndex];
  const marker = trailMarkerFor(c.id, calculateScores(answers));
  const last = chapterIndex === CHAPTERS.length - 1;
  const remaining = CHAPTERS.length - 1 - chapterIndex;

  return (
    <div className="text-center sm:text-left">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gold text-ink animate-pop">
          <Flag size={24} strokeWidth={2.1} aria-hidden="true" />
        </span>
        <p className="type-kicker">{last ? "Summit reached" : `${c.name}: complete`}</p>
      </div>
      {marker && <h1 className="type-h2 mt-6 text-ink">{marker.headline}</h1>}
      {(marker || last) && (
        <GuideLine className="mt-5 text-left">
          {marker?.detail}
          {last && (
            <>
              {marker ? " " : ""}
              {GUIDE.summit}
            </>
          )}
        </GuideLine>
      )}
      {!last && (
        <p className="mt-6 font-sign text-[0.95rem] text-stone">
          {`${remaining} chapter${remaining === 1 ? "" : "s"} to go. Your full report goes much deeper than this.`}
        </p>
      )}
      <CardFooter onBack={onBack}>
        <button onClick={onContinue} className="btn btn-primary" autoFocus>
          {last ? "See your first insights" : "Keep climbing"}
          <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
        </button>
      </CardFooter>
    </div>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────────────

function CardMeta({ left, right }: { left: React.ReactNode; right: string }) {
  return (
    <div className="flex items-center justify-between gap-3 font-sign text-[0.95rem]">
      <span className="flex items-center gap-1.5 font-medium text-pine-2">{left}</span>
      <span className="tabular-nums text-stone">{right}</span>
    </div>
  );
}

function CardFooter({
  onBack,
  children,
  hint,
  note,
}: {
  onBack: () => void;
  children?: React.ReactNode;
  hint?: "keys";
  note?: string;
}) {
  return (
    <div className="mt-8 border-t border-line/70 pt-5">
      {note && <p className="mb-4 font-sign text-sm text-stone">{note}</p>}
      <div className="flex flex-wrap-reverse items-center justify-between gap-3">
        <button onClick={onBack} className="btn btn-quiet btn-sm -ml-1">
          <ArrowLeft size={17} aria-hidden="true" />
          Back
        </button>
        {hint === "keys" && (
          <span className="hidden items-center gap-1.5 font-sign text-sm text-stone sm:flex">
            <Keyboard size={15} aria-hidden="true" />
            Keys 1–5 work too
          </span>
        )}
        {children}
      </div>
    </div>
  );
}

function Choice({
  label,
  selected,
  onClick,
  keyHint,
  multi,
  scale,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  keyHint?: number;
  multi?: boolean;
  scale?: number;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`group flex w-full items-center gap-3.5 rounded-[14px] border px-3.5 py-3 text-left transition-all duration-200 ${
        selected
          ? "border-pine bg-pine text-snow shadow-[0_10px_24px_-14px_rgb(33_63_53/0.9)]"
          : disabled
          ? "cursor-not-allowed border-line bg-snow/40 text-stone"
          : "border-line bg-snow/75 text-ink hover:-translate-y-px hover:border-pine/50 hover:bg-snow hover:shadow-[0_8px_20px_-14px_rgb(33_63_53/0.6)]"
      }`}
    >
      {multi ? (
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-[1.5px] transition-colors ${
            selected ? "border-gold bg-gold text-ink" : "border-line bg-snow text-transparent group-hover:border-pine/50"
          }`}
        >
          <Check size={16} strokeWidth={3} aria-hidden="true" />
        </span>
      ) : keyHint ? (
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-sign text-sm font-semibold tabular-nums transition-colors ${
            selected ? "bg-gold text-ink" : "bg-mist text-slate group-hover:bg-pine/10 group-hover:text-pine"
          }`}
          aria-hidden="true"
        >
          {keyHint}
        </span>
      ) : null}
      <span className="flex-1 font-sign text-[1.05rem] font-medium leading-snug">{label}</span>
      {scale !== undefined && <ScaleDots level={scale} on={selected} />}
    </button>
  );
}

/** Five small dots that fill left to right, so the scale reads at a glance. */
function ScaleDots({ level, on }: { level: number; on: boolean }) {
  return (
    <span className="hidden shrink-0 items-center gap-1 sm:flex" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i <= level ? (on ? "bg-gold" : "bg-pine/45") : on ? "bg-snow/25" : "bg-line"}`}
        />
      ))}
    </span>
  );
}

// ─── Development only ─────────────────────────────────────────────────────────

function DevFill({ onFill }: { onFill: (p: Progress) => void }) {
  return (
    <button
      onClick={() => {
        const answers: Record<number, number> = {};
        SECTIONS.forEach((s) => s.questions.forEach((q) => (answers[q.id] = 1 + ((q.id * 7) % 5))));
        onFill({
          ...START,
          answers,
          context: {
            ageRange: "35–44",
            relationshipStatus: "Married",
            hasChildren: "Yes",
            workField: "Sales",
            hobby: "Twenty years of competitive pool",
            clarityGoal: "My career or calling|Who I am, underneath it all",
            lifeStage: "Navigating (transition, uncertainty, change)",
            hardestThing: "Starting a new role while staying present for my family",
            socialPerception: "Always on, always helping",
            tooMuch: "My need to see potential in everyone",
            worstSelf: "Intellectualize and analyze everything",
            ninetyDayHope: "Feel steady and present at home",
          },
        });
      }}
      className="fixed bottom-3 left-3 z-50 rounded-lg bg-ink/80 px-3 py-2 font-sign text-xs text-snow"
    >
      Dev: fill and finish
    </button>
  );
}
