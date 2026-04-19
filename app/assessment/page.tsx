"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS, TOTAL_QUESTIONS } from "@/lib/questions";
import { calculateScores } from "@/lib/scoring"; // used by handleNext

// ─── Types ────────────────────────────────────────────────────────────────────

type SonderContext = {
  // Screen 1
  ageRange: string;
  relationshipStatus: string;
  hasChildren: string;
  workField: string;
  hobby: string;
  clarityGoal: string;
  // Screen 2
  hardestThing: string;
  socialPerception: string;
  tooMuch: string;
  lifeStage: string;
  worstSelf: string;
};

// ─── Dev-only test data (real scores from user's own assessment) ──────────────
const DEV_SCORES = {
  bigFive: { Neuroticism: 53, Extraversion: 80, Openness: 83, Agreeableness: 83, Conscientiousness: 77 },
  holland: { Realistic: 47, Investigative: 27, Artistic: 60, Social: 80, Enterprising: 80, Conventional: 33 },
  attachment: { Avoidance: 43, Anxiety: 47 },
  topStrengths: ["Creativity", "Curiosity", "Perspective", "Honesty", "Zest"],
  allStrengths: {
    Creativity: 5, Curiosity: 5, Perspective: 5, Bravery: 4, Perseverance: 2,
    Honesty: 5, Zest: 5, Kindness: 5, "Social Intelligence": 5, Teamwork: 5,
    Fairness: 4, Humility: 4,
  },
};

const DEV_CONTEXT: SonderContext = {
  ageRange: "35–44",
  relationshipStatus: "Married",
  hasChildren: "Yes",
  workField: "Financial advisor for State Farm, just started.",
  hobby: "I've been playing pool (8ball, 9ball) for 20 years and love it. Still competing and practicing every week. It's my passion.",
  clarityGoal: "All of the above",
  hardestThing: "Starting a new career at State Farm while trying to be present for my family",
  socialPerception: "They say I'm always on, always helping, never seem to need anything",
  tooMuch: "My need to see potential in everyone and everything",
  lifeStage: "Navigating",
  worstSelf: "Intellectualize and analyze everything",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter();
  const [intakeStep, setIntakeStep] = useState<"screen1" | "transition" | "screen2" | "questions">("screen1");
  const [context, setContext] = useState<SonderContext>({
    ageRange: "",
    relationshipStatus: "",
    hasChildren: "",
    workField: "",
    hobby: "",
    clarityGoal: "",
    hardestThing: "",
    socialPerception: "",
    tooMuch: "",
    lifeStage: "",
    worstSelf: "",
  });
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [sectionIndex, setSectionIndex] = useState(0);

  const section = SECTIONS[sectionIndex];
  const isLastSection = sectionIndex === SECTIONS.length - 1;

  const answeredInSection = section.questions.filter(
    (q) => answers[q.id] !== undefined
  ).length;
  const allAnswered = answeredInSection === section.questions.length;
  const remaining = section.questions.length - answeredInSection;

  const totalAnswered = Object.keys(answers).length;
  const progressPct = Math.round((totalAnswered / TOTAL_QUESTIONS) * 100);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sectionIndex, intakeStep]);

  function handleAnswer(questionId: number, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleScreen1Continue() {
    setIntakeStep("transition");
    setTimeout(() => setIntakeStep("screen2"), 1800);
  }

  function handleScreen2Continue() {
    localStorage.setItem("sonder_context", JSON.stringify(context));
    setIntakeStep("questions");
  }

  function handleDevFill() {
    localStorage.removeItem("sonder_report");
    localStorage.setItem("sonder_scores", JSON.stringify(DEV_SCORES));
    localStorage.setItem("sonder_context", JSON.stringify(DEV_CONTEXT));
    router.push("/preview");
  }

  function handleNext() {
    if (!allAnswered) return;
    if (!isLastSection) {
      setSectionIndex((i) => i + 1);
    } else {
      const scores = calculateScores(answers);
      localStorage.setItem("sonder_scores", JSON.stringify(scores));
      router.push("/preview");
    }
  }

  if (intakeStep === "screen1") {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
        <header className="px-6 sm:px-10 py-4 border-b border-stone-light/30">
          <span className="font-serif text-xl font-bold text-forest">Sonder</span>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 py-10 pb-20">
          <IntakeScreen context={context} onChange={setContext} onContinue={handleScreen1Continue} />
        </main>
        {process.env.NODE_ENV === "development" && (
          <button onClick={handleDevFill} className="fixed bottom-4 left-4 z-50 bg-bark text-parchment text-xs font-medium px-3 py-2 rounded opacity-70 hover:opacity-100 transition-opacity">
            Quick Test Fill
          </button>
        )}
      </div>
    );
  }

  if (intakeStep === "transition") {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex flex-col items-center justify-center px-6">
        <p
          className="text-bark text-center text-lg sm:text-xl max-w-sm leading-relaxed animate-fade-up"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic" }}
        >
          A few more questions, closer to the surface of things.
        </p>
      </div>
    );
  }

  if (intakeStep === "screen2") {
    return (
      <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
        <header className="px-6 sm:px-10 py-4 border-b border-stone-light/30">
          <span className="font-serif text-xl font-bold text-forest">Sonder</span>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 py-10 pb-20">
          <IntakeScreen2 context={context} onChange={setContext} onContinue={handleScreen2Continue} />
        </main>
        {process.env.NODE_ENV === "development" && (
          <button onClick={handleDevFill} className="fixed bottom-4 left-4 z-50 bg-bark text-parchment text-xs font-medium px-3 py-2 rounded opacity-70 hover:opacity-100 transition-opacity">
            Quick Test Fill
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex flex-col">
      {/* ── Sticky header + progress bar ── */}
      <header className="sticky top-0 z-50 shrink-0 bg-[#F9F7F4] border-b border-stone-light/30">
        <div className="px-6 sm:px-10 py-4 flex items-center justify-between">
          <span className="font-serif text-xl font-bold text-forest">Sonder</span>
          <span className="text-sm text-stone">
            Section {sectionIndex + 1} of {SECTIONS.length}
          </span>
        </div>
        <div className="h-1 w-full bg-parchment-dark">
          <div
            className="h-full bg-forest transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 py-8 pb-20">
        {/* Section header */}
        <div className="mb-8">
          <p className="text-xs font-medium text-forest tracking-widest uppercase mb-1">
            {section.framework}
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-bark mb-2">
            {section.title}
          </h1>
          <p className="text-stone text-sm mb-4">{section.subtitle}</p>

          {/* Section progress dots */}
          <div className="flex items-center gap-2 mb-4">
            {SECTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < sectionIndex
                    ? "w-6 bg-forest"
                    : i === sectionIndex
                    ? "w-8 bg-forest"
                    : "w-4 bg-stone-light"
                }`}
              />
            ))}
          </div>

          {/* Scale legend */}
          <div className="inline-flex items-center gap-1.5 text-xs text-stone bg-parchment-dark px-3 py-1.5 rounded">
            <span className="font-semibold text-bark">1</span>
            <span>= {section.scaleLow}</span>
            <span className="text-stone-light mx-1">·</span>
            <span className="font-semibold text-bark">5</span>
            <span>= {section.scaleHigh}</span>
          </div>
        </div>

        {/* Questions */}
        <div className="divide-y divide-stone-light/20">
          {(() => {
            const firstUnanswered = section.questions.findIndex(
              (q) => answers[q.id] === undefined
            );
            return section.questions.map((question, idx) => (
              <QuestionItem
                key={question.id}
                questionId={question.id}
                text={question.text}
                answer={answers[question.id]}
                scaleLow={section.scaleLow}
                scaleHigh={section.scaleHigh}
                onChange={(val) => handleAnswer(question.id, val)}
                dimmed={firstUnanswered !== -1 && idx > firstUnanswered}
              />
            ));
          })()}
        </div>

        {/* ── Bottom nav ── */}
        <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone">
            {allAnswered ? (
              <span className="text-forest-light font-medium">
                ✓ All questions answered
              </span>
            ) : (
              <>
                {remaining} question{remaining !== 1 ? "s" : ""} remaining in
                this section
              </>
            )}
          </p>

          <button
            onClick={handleNext}
            disabled={!allAnswered}
            className={`w-full sm:w-auto px-8 py-4 rounded-full font-medium text-base tracking-wide transition-all duration-200 ${
              allAnswered
                ? "bg-forest text-parchment hover:bg-forest-light cursor-pointer"
                : "bg-stone-light/40 text-stone cursor-not-allowed"
            }`}
          >
            {isLastSection ? "See My Results" : "Next Section →"}
          </button>
        </div>
      </main>

      {/* Dev-only quick fill — never shown in production */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={handleDevFill}
          className="fixed bottom-4 left-4 z-50 bg-bark text-parchment text-xs font-medium px-3 py-2 rounded opacity-70 hover:opacity-100 transition-opacity"
        >
          Quick Test Fill
        </button>
      )}
    </div>
  );
}

// ─── Intake Screen ────────────────────────────────────────────────────────────

function IntakeScreen({
  context,
  onChange,
  onContinue,
}: {
  context: SonderContext;
  onChange: (c: SonderContext) => void;
  onContinue: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const canContinue = context.clarityGoal !== "" && agreed;

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-medium text-forest tracking-widest uppercase mb-1">
          The first steps
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bark mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Tell me about your life.
        </h1>
        <p className="text-stone text-sm">
          I&rsquo;ll use this to write for you, not someone like you.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Age range */}
        <IntakeRadioGroup
          label="How old are you?"
          options={["Under 25", "25–34", "35–44", "45–54", "55+"]}
          value={context.ageRange}
          onChange={(v) => onChange({ ...context, ageRange: v })}
          optional
        />

        {/* Relationship status */}
        <IntakeRadioGroup
          label="What's your relationship status?"
          options={["Single", "In a relationship", "Married", "Divorced or separated"]}
          value={context.relationshipStatus}
          onChange={(v) => onChange({ ...context, relationshipStatus: v })}
          optional
        />

        {/* Children */}
        <IntakeRadioGroup
          label="Do you have children?"
          options={["No", "Yes"]}
          value={context.hasChildren}
          onChange={(v) => onChange({ ...context, hasChildren: v })}
          optional
        />

        {/* Work field */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            What field do you work in?{" "}
            <span className="font-normal text-stone">(optional)</span>
          </p>
          <input
            type="text"
            maxLength={100}
            value={context.workField}
            onChange={(e) => onChange({ ...context, workField: e.target.value })}
            placeholder="e.g. finance, education, healthcare..."
            className="w-full bg-transparent border-0 border-b border-stone-light/60 px-0 py-2.5 text-sm text-bark placeholder:text-stone-light focus:outline-none focus:border-forest/60 transition-colors"
          />
        </div>

        {/* Hobby / long-term pursuit */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            Is there a skill or pursuit you&rsquo;ve spent years refining?{" "}
            <span className="font-normal text-stone">(optional)</span>
          </p>
          <textarea
            maxLength={150}
            rows={3}
            value={context.hobby}
            onChange={(e) => onChange({ ...context, hobby: e.target.value })}
            placeholder="e.g. chess, woodworking, distance running..."
            className="w-full block mb-0 bg-transparent border-0 border-b border-stone-light/60 px-0 pt-2.5 pb-0 text-sm text-bark placeholder:text-stone-light focus:outline-none focus:border-forest/60 transition-colors resize-none"
          />
        </div>

        {/* Clarity goal — required */}
        <IntakeRadioGroup
          label="What do you most want clarity on?"
          options={[
            "My career direction",
            "My relationships",
            "Who I am as a person",
            "All of the above",
          ]}
          value={context.clarityGoal}
          onChange={(v) => onChange({ ...context, clarityGoal: v })}
          required
        />
      </div>

      {/* Disclaimer checkbox */}
      <label className="mt-8 flex items-start gap-3 cursor-pointer">
        <div className="relative flex-shrink-0 mt-0.5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="sr-only"
          />
          <div
            className="w-4 h-4 rounded border transition-colors duration-150 flex items-center justify-center"
            style={{
              borderColor: agreed ? "#3D5A3E" : "#B8B2A8",
              backgroundColor: agreed ? "#3D5A3E" : "transparent",
            }}
          >
            {agreed && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-stone leading-relaxed">
          I understand that Sonder is a self-reflection tool and not a substitute for professional mental health care. I am 18 or older.
        </span>
      </label>

      <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-stone max-w-xs leading-relaxed text-center sm:text-left">
          Everything here is optional. Nothing is stored on our servers.
        </p>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`w-full sm:w-auto px-7 py-3 rounded-full font-medium text-base tracking-wide transition-all duration-200 ${
            canContinue
              ? "bg-forest text-parchment hover:bg-forest-light cursor-pointer"
              : "bg-stone-light/40 text-stone cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Intake Screen 2 ─────────────────────────────────────────────────────────

function IntakeScreen2({
  context,
  onChange,
  onContinue,
}: {
  context: SonderContext;
  onChange: (c: SonderContext) => void;
  onContinue: () => void;
}) {
  const canContinue = context.worstSelf !== "";

  return (
    <div>
      <div className="mb-10">
        <p className="text-xs font-medium text-forest tracking-widest uppercase mb-1">
          Going inward
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-bark mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Now tell me about your inner world.
        </h1>
        <p className="text-stone text-sm">
          Answer only what feels honest. The report becomes more precise with each answer — but it will be good no matter what you share.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Hardest thing */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            What&rsquo;s the hardest thing you&rsquo;re navigating right now?{" "}
            <span className="font-normal text-stone">(optional)</span>
          </p>
          <input
            type="text"
            maxLength={150}
            value={context.hardestThing}
            onChange={(e) => onChange({ ...context, hardestThing: e.target.value })}
            placeholder="A career transition, a relationship, a loss, a decision..."
            className="w-full bg-transparent border-0 border-b border-stone-light/60 px-0 py-2.5 text-sm text-bark placeholder:text-stone-light focus:outline-none focus:border-forest/60 transition-colors"
          />
        </div>

        {/* Social perception */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            How do the people closest to you describe you?{" "}
            <span className="font-normal text-stone">(optional)</span>
          </p>
          <input
            type="text"
            maxLength={150}
            value={context.socialPerception}
            onChange={(e) => onChange({ ...context, socialPerception: e.target.value })}
            placeholder="They say I'm..."
            className="w-full bg-transparent border-0 border-b border-stone-light/60 px-0 py-2.5 text-sm text-bark placeholder:text-stone-light focus:outline-none focus:border-forest/60 transition-colors"
          />
        </div>

        {/* Too much */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            What&rsquo;s a quality you have that people sometimes tell you is &ldquo;too much&rdquo;?{" "}
            <span className="font-normal text-stone">(optional)</span>
          </p>
          <input
            type="text"
            maxLength={150}
            value={context.tooMuch}
            onChange={(e) => onChange({ ...context, tooMuch: e.target.value })}
            placeholder="My intensity, my need to help, my attention to detail..."
            className="w-full bg-transparent border-0 border-b border-stone-light/60 px-0 py-2.5 text-sm text-bark placeholder:text-stone-light focus:outline-none focus:border-forest/60 transition-colors"
          />
        </div>

        {/* Life stage */}
        <IntakeRadioGroup
          label="Where are you right now in life?"
          options={[
            "Building (new role, new relationship, new chapter)",
            "Navigating (transition, uncertainty, change)",
            "Rebuilding (after loss, divorce, or major shift)",
            "Deepening (established, seeking more meaning)",
          ]}
          value={context.lifeStage}
          onChange={(v) => onChange({ ...context, lifeStage: v })}
          optional
        />

        {/* Worst self — required */}
        <IntakeRadioGroup
          label="When you're at your worst, you tend to:"
          options={[
            "Withdraw and go quiet",
            "Push harder and control more",
            "Seek reassurance from others",
            "Distract yourself and stay busy",
            "Intellectualize and analyze everything",
          ]}
          value={context.worstSelf}
          onChange={(v) => onChange({ ...context, worstSelf: v })}
          required
        />
      </div>

      <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-stone max-w-xs leading-relaxed text-center sm:text-left">
          Your answers are yours alone. Nothing is stored.
        </p>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`w-full sm:w-auto px-7 py-3 rounded-full font-medium text-base tracking-wide transition-all duration-200 ${
            canContinue
              ? "bg-forest text-parchment hover:bg-forest-light cursor-pointer"
              : "bg-stone-light/40 text-stone cursor-not-allowed"
          }`}
        >
          Continue to Assessment →
        </button>
      </div>
    </div>
  );
}

// ─── Intake Radio Group ───────────────────────────────────────────────────────

function IntakeRadioGroup({
  label,
  options,
  value,
  onChange,
  optional,
  required,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-bark mb-3">
        {label}{" "}
        {optional && <span className="font-normal text-stone">(optional)</span>}
        {required && <span className="font-normal text-forest"> *</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 select-none ${
                selected
                  ? "bg-forest text-parchment shadow-sm"
                  : "bg-transparent border border-stone-light/60 text-bark-light hover:border-forest/50 hover:text-forest"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Scale color config (per position 1–5) ───────────────────────────────────

const SCALE_COLOR = { border: "#2D4A2E", fill: "#2D4A2E", hoverBg: "rgba(45,74,46,0.10)" };

// ─── Likert Circle Button ─────────────────────────────────────────────────────

function LikertCircle({
  value,
  isSelected,
  ariaLabel,
  onClick,
}: {
  value: number;
  isSelected: boolean;
  ariaLabel: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-pressed={isSelected}
      aria-label={ariaLabel}
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        border: `1.5px solid ${SCALE_COLOR.border}`,
        backgroundColor: isSelected
          ? SCALE_COLOR.fill
          : hovered
          ? SCALE_COLOR.hoverBg
          : "transparent",
        transform: hovered && !isSelected ? "scale(1.1)" : "scale(1)",
        transition: "background-color 150ms ease, transform 150ms ease",
        cursor: "pointer",
        outlineColor: SCALE_COLOR.border,
      }}
    >
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          lineHeight: 1,
          color: isSelected ? "white" : SCALE_COLOR.border,
          userSelect: "none",
        }}
      >
        {value}
      </span>
    </button>
  );
}

// ─── Question Item ────────────────────────────────────────────────────────────

type QuestionItemProps = {
  questionId: number;
  text: string;
  answer: number | undefined;
  scaleLow: string;
  scaleHigh: string;
  onChange: (value: number) => void;
  dimmed?: boolean;
};

function QuestionItem({
  questionId: _questionId,
  text,
  answer,
  scaleLow,
  scaleHigh,
  onChange,
  dimmed,
}: QuestionItemProps) {
  const isAnswered = answer !== undefined;

  return (
    <div
      className="py-6 transition-opacity duration-300"
      style={{ opacity: dimmed ? 0.38 : 1 }}
    >
      <p
        className={`text-bark leading-snug mb-5 text-base sm:text-[1.0625rem] transition-all duration-200 ${
          isAnswered ? "font-medium" : "font-normal"
        }`}
      >
        {text}
      </p>

      <div
        className="flex items-center justify-between gap-2 sm:gap-3"
        role="group"
        aria-label={`Answer: ${text}`}
      >
        {/* Disagree label */}
        <span className="text-[10px] sm:text-xs text-stone whitespace-nowrap leading-tight">
          Disagree
        </span>

        {/* Circle buttons */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {([1, 2, 3, 4, 5] as const).map((val) => (
            <LikertCircle
              key={val}
              value={val}
              isSelected={answer === val}
              ariaLabel={`${val} — ${
                val === 1 ? scaleLow : val === 5 ? scaleHigh : String(val)
              }`}
              onClick={() => onChange(val)}
            />
          ))}
        </div>

        {/* Agree label */}
        <span className="text-[10px] sm:text-xs text-stone whitespace-nowrap leading-tight">
          Agree
        </span>
      </div>
    </div>
  );
}
