"use client";

// Ember: Sonder's guide. A small, old, living flame that lives in a trail
// lantern. Warm and wise, not cute: calm heavy-lidded eyes, an understated
// mouth, and most of the feeling carried by the flame's shape and light.
//
// Two framings of the same drawing:
//   - "lantern": the whole lantern (welcome, loading, summit, landing)
//   - "portrait": a close crop of Ember's face for small avatars

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
  framing = "lantern",
  className = "",
  title,
}: {
  mood?: EmberMood;
  size?: number;
  framing?: "lantern" | "portrait";
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const g = (n: string) => `${n}-${uid}`;
  const portrait = framing === "portrait";
  const viewBox = portrait ? "29 43 62 62" : "0 0 120 136";
  const height = portrait ? size : Math.round((size * 136) / 120);
  const tall = mood === "celebrating" || mood === "writing" || mood === "pleased";
  const low = mood === "gentle";

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={height}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <defs>
        <radialGradient id={g("halo")} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FFD98A" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFD98A" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={g("glass")} cx="50%" cy="62%" r="65%">
          <stop offset="0%" stopColor="#FFF0C9" />
          <stop offset="55%" stopColor="#F9D493" />
          <stop offset="100%" stopColor="#D99A47" />
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
        <linearGradient id={g("brass")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3B867" />
          <stop offset="100%" stopColor="#A7742A" />
        </linearGradient>
        <linearGradient id={g("iron")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A5D6B" />
          <stop offset="100%" stopColor="#2C3A44" />
        </linearGradient>
      </defs>

      {/* Warm halo */}
      <circle cx="60" cy="76" r={portrait ? 30 : 56} fill={`url(#${g("halo")})`} className="ember-glow" />

      {!portrait && (
        <g>
          {/* Wire bail and ring */}
          <path d="M41 25 C40 6, 80 6, 79 25" fill="none" stroke={`url(#${g("iron")})`} strokeWidth="3.6" strokeLinecap="round" />
          <circle cx="60" cy="8.5" r="3.4" fill="none" stroke="#3B4D5B" strokeWidth="2.6" />
          {/* Roof */}
          <path d="M33 33 L44 21 H76 L87 33 Z" fill={`url(#${g("iron")})`} />
          <rect x="52" y="15" width="16" height="7" rx="2" fill="#3B4D5B" />
          <rect x="29" y="31.5" width="62" height="6" rx="3" fill={`url(#${g("brass")})`} />
        </g>
      )}

      {/* Glass */}
      <rect x="32" y="37.5" width="56" height="70" rx="13" fill={`url(#${g("glass")})`} />

      {/* The flame */}
      <g
        className="ember-flicker"
        style={{ transformOrigin: "60px 104px", transform: tall ? "scale(1.06)" : low ? "scale(0.94)" : undefined }}
      >
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

      {!portrait && (
        <g>
          {/* Glass frame and guard wires, drawn over the flame edges */}
          <rect x="32" y="37.5" width="56" height="70" rx="13" fill="none" stroke={`url(#${g("iron")})`} strokeWidth="3" />
          <path d="M40.5 38 C37.5 56 37.5 89 40.5 107" fill="none" stroke="#3B4D5B" strokeWidth="2" opacity="0.85" />
          <path d="M79.5 38 C82.5 56 82.5 89 79.5 107" fill="none" stroke="#3B4D5B" strokeWidth="2" opacity="0.85" />
          <path d="M36 44 C37 41 39 39.5 42 39" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
          {/* Base */}
          <rect x="29" y="106" width="62" height="6" rx="3" fill={`url(#${g("brass")})`} />
          <path d="M33.5 112 H86.5 L82.5 125 C81.8 127.6 79.8 129 77.2 129 H42.8 C40.2 129 38.2 127.6 37.5 125 Z" fill={`url(#${g("iron")})`} />
          <path d="M40 118 H80" stroke="#5A6E7C" strokeWidth="1.4" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}

/** Ember's face in a pine circle, for small avatars next to the guide's words. */
export function EmberAvatar({ mood = "calm", size = 48, className = "" }: { mood?: EmberMood; size?: number; className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_62%,#3a5f4f,#213F35_68%)] shadow-[0_8px_20px_-10px_rgb(33_63_53/0.85)] ring-1 ring-black/5 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Ember mood={mood} framing="portrait" size={size} />
    </span>
  );
}
