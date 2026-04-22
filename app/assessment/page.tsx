"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SECTIONS, TOTAL_QUESTIONS } from "@/lib/questions";
import { calculateScores } from "@/lib/scoring";

// ─── Types ────────────────────────────────────────────────────────────────────

type SonderContext = {
  ageRange: string;
  relationshipStatus: string;
  hasChildren: string;
  workField: string;
  hobby: string;
  clarityGoal: string;
  hardestThing: string;
  socialPerception: string;
  tooMuch: string;
  lifeStage: string;
  worstSelf: string;
};

// ─── Dev-only test data ───────────────────────────────────────────────────────

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
  clarityGoal: "career direction, relationships, and who I am as a person",
  hardestThing: "Starting a new career at State Farm while trying to be present for my family",
  socialPerception: "They say I'm always on, always helping, never seem to need anything",
  tooMuch: "My need to see potential in everyone and everything",
  lifeStage: "Navigating",
  worstSelf: "Intellectualize and analyze everything",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const router = useRouter();
  const [intakeStep, setIntakeStep] = useState<"screen1" | "screen2" | "questions">("screen1");
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
    setIntakeStep("screen2");
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
      <div className="min-h-screen bg-cream flex flex-col">
        <header className="px-6 sm:px-10 py-4 border-b border-ash">
          <a href="/" className="font-serif-display text-xl font-bold text-forest hover:opacity-70 transition-opacity">Sonder</a>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 py-10 pb-20">
          <IntakeScreen context={context} onChange={setContext} onContinue={handleScreen1Continue} />
        </main>
        {/* TODO: remove before public launch */}
        <button onClick={handleDevFill} className="fixed bottom-4 left-4 z-50 bg-bark text-parchment text-xs font-medium px-3 py-2 rounded opacity-70 hover:opacity-100 transition-opacity">
          Founder Test
        </button>
      </div>
    );
  }

  if (intakeStep === "screen2") {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <header className="px-6 sm:px-10 py-4 border-b border-ash">
          <a href="/" className="font-serif-display text-xl font-bold text-forest hover:opacity-70 transition-opacity">Sonder</a>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 py-10 pb-20">
          <IntakeScreen2 context={context} onChange={setContext} onContinue={handleScreen2Continue} onBack={() => setIntakeStep("screen1")} />
        </main>
        {/* TODO: remove before public launch */}
        <button onClick={handleDevFill} className="fixed bottom-4 left-4 z-50 bg-bark text-parchment text-xs font-medium px-3 py-2 rounded opacity-70 hover:opacity-100 transition-opacity">
          Founder Test
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* ── Sticky header + progress bar ── */}
      <header className="sticky top-0 z-50 shrink-0 bg-cream border-b border-ash">
        <div className="px-6 sm:px-10 py-4 flex items-center justify-between">
          <a href="/" className="font-serif-display text-xl font-bold text-forest hover:opacity-70 transition-opacity">Sonder</a>
          <span className="text-xs text-moss uppercase tracking-widest">
            Section {sectionIndex + 1} of {SECTIONS.length}
          </span>
        </div>
        <div className="h-1 w-full bg-ash">
          <div
            className="h-full bg-forest transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 py-8 pb-20">
        {/* Section header */}
        <div className="mb-10">
          <p className="text-xs font-medium text-moss uppercase mb-2" style={{ letterSpacing: "0.22em" }}>
            {section.framework}
          </p>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-bark mt-1 mb-3">
            {section.title}
          </h1>
          <p className="text-bark-light text-sm mb-6 font-serif-reading leading-relaxed">{section.subtitle}</p>

          {/* Section progress segments */}
          <div className="flex items-center gap-2 mb-6">
            {SECTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i < sectionIndex
                    ? "w-6 bg-forest"
                    : i === sectionIndex
                    ? "w-8 bg-forest"
                    : "w-4 bg-ash"
                }`}
              />
            ))}
          </div>

          {/* Scale legend — plain text, no box */}
          <p className="text-xs text-moss text-center" style={{ letterSpacing: "0.14em" }}>
            1 = {section.scaleLow} &nbsp;·&nbsp; 5 = {section.scaleHigh}
          </p>
        </div>

        {/* Questions */}
        <div className="divide-y divide-ash">
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
        <div className="mt-12 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-moss">
            {allAnswered ? (
              <span className="text-forest font-medium">
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
            className={`w-full sm:w-auto px-10 py-3.5 rounded-full font-medium text-base tracking-wide transition-colors duration-300 ${
              allAnswered
                ? "border border-forest text-forest hover:bg-forest/10 cursor-pointer"
                : "border border-ash text-moss cursor-not-allowed"
            }`}
          >
            {isLastSection ? "See My Results" : "Next Section →"}
          </button>
        </div>
      </main>

      {/* TODO: remove before public launch */}
      <button
        onClick={handleDevFill}
        className="fixed bottom-4 left-4 z-50 bg-bark text-parchment text-xs font-medium px-3 py-2 rounded opacity-70 hover:opacity-100 transition-opacity"
      >
        Founder Test
      </button>
    </div>
  );
}

// ─── Intake Screen 1 ──────────────────────────────────────────────────────────

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
  const [claritySelections, setClaritySelections] = useState<string[]>([]);
  const canContinue = claritySelections.length > 0;

  function handleContinue() {
    onChange({ ...context, clarityGoal: joinClarityGoals(claritySelections) });
    onContinue();
  }

  return (
    <div>
      <div className="mb-12">
        <p className="text-xs font-medium text-moss uppercase mb-3" style={{ letterSpacing: "0.22em" }}>
          The first steps
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-bark mt-2 mb-5">
          Tell me about your life.
        </h1>
        <p className="text-bark-light text-lg sm:text-xl font-serif-reading leading-relaxed">
          I&rsquo;ll use this to write for you, not someone like you.
        </p>
      </div>

      <div className="flex flex-col gap-10">
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
            What field do you work in?
          </p>
          <input
            type="text"
            maxLength={100}
            value={context.workField}
            onChange={(e) => onChange({ ...context, workField: e.target.value })}
            placeholder="e.g. finance, education, healthcare..."
            className="w-full bg-transparent border-0 border-b border-ash px-0 py-2.5 text-base text-bark placeholder:text-moss focus:outline-none focus:border-forest transition-colors font-serif-reading"
          />
        </div>

        {/* Hobby / long-term pursuit */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            Is there a skill or pursuit you&rsquo;ve spent years refining?
          </p>
          <textarea
            maxLength={150}
            rows={3}
            value={context.hobby}
            onChange={(e) => onChange({ ...context, hobby: e.target.value })}
            placeholder="e.g. chess, woodworking, distance running..."
            className="w-full block bg-transparent border-0 border-b border-ash px-0 pt-2.5 pb-0 text-base text-bark placeholder:text-moss focus:outline-none focus:border-forest transition-colors resize-none font-serif-reading"
          />
        </div>

        {/* Clarity goal — required, multi-select */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            What do you most want clarity on?{" "}
            <span className="font-normal" style={{ color: "#A0524D" }}> *</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {["My career direction", "My relationships", "Who I am as a person"].map((opt) => {
              const selected = claritySelections.includes(opt);
              return (
                <IntakeChip
                  key={opt}
                  label={opt}
                  selected={selected}
                  onClick={() =>
                    setClaritySelections((prev) =>
                      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
                    )
                  }
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Disclaimer checkbox */}
      <label className="mt-10 flex items-start gap-3 cursor-pointer">
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
              borderColor: agreed ? "#5A7250" : "#E8E3DC",
              backgroundColor: agreed ? "#5A7250" : "transparent",
            }}
          >
            {agreed && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-moss leading-relaxed">
          I understand that Sonder is a self-reflection tool and not a substitute for professional mental health care. I am 18 or older.
        </span>
      </label>

      <div className="mt-12 flex flex-col items-center gap-5 text-center">
        <p className="text-sm text-moss italic font-serif-reading leading-relaxed">
          Everything here is optional. Your answers never leave your browser.
        </p>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full sm:w-auto px-10 py-3.5 rounded-full font-medium text-base tracking-wide transition-colors duration-300 ${
            canContinue
              ? "border border-forest text-forest hover:bg-forest/10 cursor-pointer"
              : "border border-ash text-moss cursor-not-allowed"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Intake Screen 2 ──────────────────────────────────────────────────────────

function IntakeScreen2({
  context,
  onChange,
  onContinue,
  onBack,
}: {
  context: SonderContext;
  onChange: (c: SonderContext) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const canContinue = context.worstSelf !== "";

  return (
    <div>
      <button
        onClick={onBack}
        className="text-xs text-moss hover:text-bark transition-colors mb-8 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="mb-12">
        <p className="text-xs font-medium text-moss uppercase mb-3" style={{ letterSpacing: "0.22em" }}>
          Going inward
        </p>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-bark mt-2 mb-5">
          Now tell me about your inner world.
        </h1>
        <p className="text-bark-light text-lg sm:text-xl font-serif-reading leading-relaxed">
          Answer only what feels honest. The report becomes more precise with each answer — but it will be good no matter what you share.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Hardest thing */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            What&rsquo;s the hardest thing you&rsquo;re navigating right now?
          </p>
          <input
            type="text"
            maxLength={150}
            value={context.hardestThing}
            onChange={(e) => onChange({ ...context, hardestThing: e.target.value })}
            placeholder="A career transition, a relationship, a loss, a decision..."
            className="w-full bg-transparent border-0 border-b border-ash px-0 py-2.5 text-base text-bark placeholder:text-moss focus:outline-none focus:border-forest transition-colors font-serif-reading"
          />
        </div>

        {/* Social perception */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            How do the people closest to you describe you?
          </p>
          <input
            type="text"
            maxLength={150}
            value={context.socialPerception}
            onChange={(e) => onChange({ ...context, socialPerception: e.target.value })}
            placeholder="They say I'm..."
            className="w-full bg-transparent border-0 border-b border-ash px-0 py-2.5 text-base text-bark placeholder:text-moss focus:outline-none focus:border-forest transition-colors font-serif-reading"
          />
        </div>

        {/* Too much */}
        <div>
          <p className="text-sm font-medium text-bark mb-3">
            What&rsquo;s something about you that you&rsquo;ve learned to love, even if others haven&rsquo;t always understood it?
          </p>
          <input
            type="text"
            maxLength={150}
            value={context.tooMuch}
            onChange={(e) => onChange({ ...context, tooMuch: e.target.value })}
            placeholder="My intensity, my need to help, my attention to detail..."
            className="w-full bg-transparent border-0 border-b border-ash px-0 py-2.5 text-base text-bark placeholder:text-moss focus:outline-none focus:border-forest transition-colors font-serif-reading"
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
          label="When life gets hard, you tend to:"
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

      <div className="mt-12 flex flex-col items-center gap-5 text-center">
        <p className="text-sm text-moss italic font-serif-reading leading-relaxed">
          Everything here is optional. Your answers never leave your browser.
        </p>
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`w-full sm:w-auto px-10 py-3.5 rounded-full font-medium text-base tracking-wide transition-colors duration-300 ${
            canContinue
              ? "border border-forest text-forest hover:bg-forest/10 cursor-pointer"
              : "border border-ash text-moss cursor-not-allowed"
          }`}
        >
          Continue to Assessment →
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function joinClarityGoals(goals: string[]): string {
  const normalized = goals.map((g) => g.replace(/^My /, "").toLowerCase());
  if (normalized.length === 1) return normalized[0];
  if (normalized.length === 2) return `${normalized[0]} and ${normalized[1]}`;
  return `${normalized.slice(0, -1).join(", ")}, and ${normalized[normalized.length - 1]}`;
}

// ─── Intake Chip ──────────────────────────────────────────────────────────────

function IntakeChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="px-5 py-2 rounded-full text-sm select-none font-serif-reading"
      style={{
        border: `1px solid ${selected ? "#5A7250" : hovered ? "#8A9383" : "#E8E3DC"}`,
        background: selected
          ? "rgba(90,114,80,0.1)"
          : hovered
          ? "rgba(232,227,220,0.4)"
          : "transparent",
        color: selected ? "#5A7250" : "#5C524B",
        transition: "border-color 300ms ease, background 300ms ease, color 300ms ease",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

// ─── Intake Radio Group ───────────────────────────────────────────────────────

function IntakeRadioGroup({
  label,
  options,
  value,
  onChange,
  optional: _optional,
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
        {required && <span className="font-normal" style={{ color: "#A0524D" }}> *</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <IntakeChip
            key={opt}
            label={opt}
            selected={value === opt}
            onClick={() => onChange(opt)}
          />
        ))}
      </div>
    </div>
  );
}

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
        border: `1px solid ${isSelected ? "#5A7250" : hovered ? "#8A9383" : "#E8E3DC"}`,
        backgroundColor: isSelected
          ? "#5A7250"
          : hovered
          ? "rgba(232,227,220,0.5)"
          : "transparent",
        transition: "background-color 300ms ease, border-color 300ms ease",
        cursor: "pointer",
        outlineColor: "#5A7250",
      }}
    >
      <span
        style={{
          fontFamily: isSelected
            ? "var(--font-playfair), Georgia, serif"
            : "var(--font-eb-garamond), Georgia, serif",
          fontSize: "13px",
          fontWeight: isSelected ? 600 : 400,
          lineHeight: 1,
          color: isSelected ? "#F5F0E8" : "#5C524B",
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
      className="py-8 transition-opacity duration-300"
      style={{ opacity: dimmed ? 0.38 : 1 }}
    >
      <p
        className={`text-bark leading-relaxed mb-6 text-[1.0625rem] sm:text-lg font-serif-reading transition-all duration-200 ${
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
        <span
          className="text-[10px] sm:text-xs text-moss whitespace-nowrap leading-tight uppercase"
          style={{ letterSpacing: "0.1em" }}
        >
          {scaleLow.split(" ")[0] || "Disagree"}
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
        <span
          className="text-[10px] sm:text-xs text-moss whitespace-nowrap leading-tight uppercase"
          style={{ letterSpacing: "0.1em" }}
        >
          {scaleHigh.split(" ")[0] || "Agree"}
        </span>
      </div>
    </div>
  );
}
