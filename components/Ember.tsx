"use client";

// Ember: Sonder's guide. A small, very old flame, drawn in a warm disc of
// light with a pine rim. Warm and wise, not cute: calm eyes, an understated
// mouth, and most of the feeling carried by the flame's shape and light.
// One drawing at every size: avatars, welcome, loading, summit, landing.

import { useId } from "react";

export type EmberMood =
  | "calm"
  | "listening"
  | "curious"
  | "pleased"
  | "thinking"
  | "writing"
  | "gentle"
  | "celebrating"
  | "amused";

const INK = "#3A2212";

function Eyes({ mood }: { mood: EmberMood }) {
  const L = 53;
  const R = 67;
  const Y = 83;
  const stroke = { fill: "none", stroke: INK, strokeWidth: 1.9, strokeLinecap: "round" as const };
  switch (mood) {
    case "pleased":
    case "celebrating":
      return (
        <g>
          <path d={`M${L - 3.2} ${Y + 1.2} Q${L} ${Y - 2.6} ${L + 3.2} ${Y + 1.2}`} {...stroke} />
          <path d={`M${R - 3.2} ${Y + 1.2} Q${R} ${Y - 2.6} ${R + 3.2} ${Y + 1.2}`} {...stroke} />
        </g>
      );
    case "listening":
      return (
        <g className="ember-blink">
          <ellipse cx={L} cy={Y} rx={2.5} ry={3.3} fill={INK} />
          <ellipse cx={R} cy={Y} rx={2.5} ry={3.3} fill={INK} />
          <circle cx={L + 0.8} cy={Y - 1.2} r={0.8} fill="#FFF6E0" />
          <circle cx={R + 0.8} cy={Y - 1.2} r={0.8} fill="#FFF6E0" />
        </g>
      );
    case "curious":
      return (
        <g className="ember-blink">
          <ellipse cx={L} cy={Y - 0.5} rx={2.7} ry={3.8} fill={INK} />
          <circle cx={L + 0.9} cy={Y - 1.8} r={0.9} fill="#FFF6E0" />
          <path d={`M${R - 3} ${Y} H${R + 3} A3 2.6 0 0 1 ${R - 3} ${Y} Z`} fill={INK} />
          <path d={`M${L - 3} ${Y - 5.8} Q${L} ${Y - 7.6} ${L + 3} ${Y - 6.2}`} {...stroke} strokeWidth={1.3} />
        </g>
      );
    case "thinking":
      return (
        <g className="ember-blink">
          <ellipse cx={L + 1.2} cy={Y - 1.2} rx={2.3} ry={3} fill={INK} />
          <ellipse cx={R + 1.2} cy={Y - 1.2} rx={2.3} ry={3} fill={INK} />
          <circle cx={L + 2} cy={Y - 2.4} r={0.7} fill="#FFF6E0" />
          <circle cx={R + 2} cy={Y - 2.4} r={0.7} fill="#FFF6E0" />
        </g>
      );
    case "writing":
      return (
        <g>
          <path d={`M${L - 3} ${Y + 1.5} H${L + 3} A3 2.2 0 0 1 ${L - 3} ${Y + 1.5} Z`} fill={INK} />
          <path d={`M${R - 3} ${Y + 1.5} H${R + 3} A3 2.2 0 0 1 ${R - 3} ${Y + 1.5} Z`} fill={INK} />
        </g>
      );
    case "gentle":
      return (
        <g className="ember-blink">
          <path d={`M${L - 3} ${Y - 0.4} L${L + 3} ${Y + 0.6} A3 2.8 0 0 1 ${L - 3} ${Y - 0.4} Z`} fill={INK} />
          <path d={`M${R - 3} ${Y + 0.6} L${R + 3} ${Y - 0.4} A3 2.8 0 0 1 ${R - 3} ${Y + 0.6} Z`} fill={INK} />
        </g>
      );
    case "amused":
      return (
        <g className="ember-blink">
          <path d={`M${L - 3} ${Y + 0.6} H${L + 3} A3 1.9 0 0 1 ${L - 3} ${Y + 0.6} Z`} fill={INK} />
          <ellipse cx={R} cy={Y} rx={2.5} ry={3.1} fill={INK} />
          <circle cx={R + 0.8} cy={Y - 1.1} r={0.8} fill="#FFF6E0" />
        </g>
      );
    case "calm":
    default:
      return (
        <g className="ember-blink">
          <path d={`M${L - 3} ${Y} H${L + 3} A3 3 0 0 1 ${L - 3} ${Y} Z`} fill={INK} />
          <path d={`M${R - 3} ${Y} H${R + 3} A3 3 0 0 1 ${R - 3} ${Y} Z`} fill={INK} />
        </g>
      );
  }
}

function Mouth({ mood }: { mood: EmberMood }) {
  const s = { fill: "none", stroke: INK, strokeWidth: 1.7, strokeLinecap: "round" as const };
  switch (mood) {
    case "pleased":
      return <path d="M56 91.5 Q60 95.5 64 91.5" {...s} />;
    case "celebrating":
      return <path d="M55.5 91 Q60 97 64.5 91 Z" fill={INK} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />;
    case "curious":
      return <ellipse cx={60.5} cy={93} rx={1.5} ry={1.8} fill={INK} />;
    case "thinking":
      return <path d="M58 93 Q61 92 63 93.5" {...s} />;
    case "writing":
      return <path d="M58 93 H62" {...s} />;
    case "gentle":
      return <path d="M57 92.5 Q60 94.5 63 92.5" {...s} strokeWidth={1.5} />;
    case "amused":
      return <path d="M57 92.5 Q61 94.8 64 91.6" {...s} />;
    case "listening":
    case "calm":
    default:
      return <path d="M57 92 Q60 94.2 63 92" {...s} />;
  }
}

/** A wisp of flame used like a hand. */
function Wisp({ mood }: { mood: EmberMood }) {
  if (mood === "thinking") {
    return <path d="M72 96 C80 95 80 88 75 87 C72 86.5 71 89 73.5 90" fill="none" stroke="#FFC766" strokeWidth={2.4} strokeLinecap="round" />;
  }
  if (mood === "celebrating") {
    return (
      <g fill="none" stroke="#FFC766" strokeWidth={2.4} strokeLinecap="round">
        <path d="M45 82 C38 78 37 70 41 66" />
        <path d="M75 82 C82 78 83 70 79 66" />
      </g>
    );
  }
  return null;
}

function Sparks({ id }: { id: string }) {
  return (
    <g fill="#FFE2A0">
      {[
        [52, 52, 0],
        [66, 48, 0.6],
        [58, 44, 1.2],
        [70, 56, 1.8],
      ].map(([x, y, d], i) => (
        <circle key={`${id}-${i}`} cx={x} cy={y} r={1.3} className="ember-spark" style={{ animationDelay: `${d}s` }} />
      ))}
    </g>
  );
}

export function Ember({
  mood = "calm",
  size = 120,
  className = "",
  title,
}: {
  mood?: EmberMood;
  size?: number;
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const g = (n: string) => `${n}-${uid}`;
  const tall = mood === "celebrating" || mood === "writing" || mood === "pleased";
  const low = mood === "gentle";
  const scale = (tall ? 1.02 : low ? 0.93 : 0.98).toFixed(3);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="22 38 76 76"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <defs>
        <radialGradient id={g("rim")} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3A5F4F" />
          <stop offset="100%" stopColor="#1B342C" />
        </radialGradient>
        <radialGradient id={g("glow")} cx="50%" cy="64%" r="58%">
          <stop offset="0%" stopColor="#FFF3D3" />
          <stop offset="50%" stopColor="#F9D898" />
          <stop offset="100%" stopColor="#DFA052" />
        </radialGradient>
        <radialGradient id={g("halo")} cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#FFF7E2" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#FFF7E2" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={g("flame")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F59A3A" />
          <stop offset="55%" stopColor="#F2A93B" />
          <stop offset="100%" stopColor="#E97E2C" />
        </linearGradient>
        <radialGradient id={g("core")} cx="50%" cy="70%" r="60%">
          <stop offset="0%" stopColor="#FFF7E2" />
          <stop offset="60%" stopColor="#FFE3A3" />
          <stop offset="100%" stopColor="#FFD079" stopOpacity={0.9} />
        </radialGradient>
        <clipPath id={g("clip")}>
          <circle cx="60" cy="76" r="33.5" />
        </clipPath>
      </defs>

      {/* Pine rim and the warm disc of light Ember lives in */}
      <circle cx="60" cy="76" r="37.5" fill={`url(#${g("rim")})`} />
      <circle cx="60" cy="76" r="33.5" fill={`url(#${g("glow")})`} />
      <g clipPath={`url(#${g("clip")})`}>
        <circle cx="60" cy="82" r="26" fill={`url(#${g("halo")})`} className="ember-glow" />
        {/* The flame, centred in the disc */}
        <g transform={`translate(60 78.5) scale(${scale}) translate(-60 -76)`}>
          <g className="ember-flicker" style={{ transformOrigin: "60px 104px" }}>
            <path
              d="M60 45 C63.5 54 76.5 62 77.5 79 C78.5 94 70 104 60 104 C50 104 41.5 94 42.5 79 C43.3 68 49.5 61.5 53.5 55.5 C54.2 61.5 57 64 59.8 60.8 C61.2 55.6 59 50.5 60 45 Z"
              fill={`url(#${g("flame")})`}
            />
            <path
              d="M60 63 C66 70 71.5 76 71.5 86 C71.5 96 66 101 60 101 C54 101 48.5 96 48.5 86 C48.5 78 53 72 56 67.5 C57 71 59 72 60 69 Z"
              fill={`url(#${g("core")})`}
            />
            <Eyes mood={mood} />
            <Mouth mood={mood} />
            <Wisp mood={mood} />
          </g>
          {(mood === "writing" || mood === "celebrating") && <Sparks id={uid} />}
        </g>
      </g>
      {/* A soft highlight on the rim */}
      <path d="M36 62 A28 28 0 0 1 50 47" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/** Ember with a soft shadow, for avatars next to the guide's words. */
export function EmberAvatar({ mood = "calm", size = 48, className = "" }: { mood?: EmberMood; size?: number; className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-full shadow-[0_8px_20px_-10px_rgb(33_63_53/0.85)] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Ember mood={mood} size={size} />
    </span>
  );
}
