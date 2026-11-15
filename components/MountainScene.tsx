// The Sonder range: layered ridges at first light with a trail that climbs to
// the summit. Used full-size in the landing hero and as a quiet ridgeline
// elsewhere. Pure SVG, no image downloads.

type Props = {
  /** Draw the dotted trail and summit flag (animated on first paint). */
  trail?: boolean;
  /** Soften colours for use behind content on light pages. */
  quiet?: boolean;
  className?: string;
};

// The back ranges and trail are drawn lower than their path coordinates (a
// gentle vertical squash anchored at the bottom), so the summit and flag sit
// well inside the frame. Wide desktop screens crop the top of this scene.
const BACK = "matrix(1 0 0 0.78 0 154)";
const SUMMIT = { x: 1010, y: 174 * 0.78 + 154 };

const TRAIL_D =
  "M330 700 C 420 655, 560 640, 620 602 S 520 545, 640 516 S 860 520, 900 470 S 818 402, 880 362 S 962 300, 950 262 S 1000 202, 1010 174";

// Deterministic tree line along the near ridge.
function treeLine(seed: number, y0: number, count: number, scale = 1) {
  const trees: string[] = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    const x = (i / count) * 1640 - 20 + rand() * 18;
    const h = (26 + rand() * 34) * scale;
    const w = h * 0.38;
    const y = y0 + Math.sin(x / 160) * 14 + rand() * 10;
    trees.push(`M${x.toFixed(1)} ${(y - h).toFixed(1)} L${(x + w).toFixed(1)} ${y.toFixed(1)} L${(x - w).toFixed(1)} ${y.toFixed(1)} Z`);
  }
  return trees.join(" ");
}

const TREES_BACK = treeLine(7, 628, 70, 0.8);
const TREES_FRONT = treeLine(19, 676, 54, 1.25);

export function MountainScene({ trail = false, quiet = false, className = "" }: Props) {
  const c = quiet
    ? { far: "#C6D0D0", midFar: "#AEBBBE", snow: "#EEF2F2", mid: "#97A8AB", near: "#7F9590", trees: "#6E8580", front: "#5F7671" }
    : { far: "#8FA0A9", midFar: "#5D717E", snow: "#E7ECEE", mid: "#3B4D5B", near: "#22382F", trees: "#1A2E27", front: "#13221D" };

  return (
    <svg
      viewBox="0 0 1600 700"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE7B0" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#F4C46F" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F4C46F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={quiet ? 0.35 : 0.12} />
        </linearGradient>
        {trail && (
          <mask id="trail-reveal">
            <path
              d={TRAIL_D}
              pathLength={1}
              fill="none"
              stroke="white"
              strokeWidth="14"
              strokeDasharray="1"
              style={{ ["--trail-length" as string]: 1, animation: "trail-draw 2.6s 0.5s cubic-bezier(0.5,0,0.2,1) both" }}
            />
          </mask>
        )}
      </defs>

      {!quiet && <circle cx="1180" cy="440" r="210" fill="url(#sun-glow)" />}
      {!quiet && <circle cx="1180" cy="440" r="44" fill="#FBE3AE" opacity="0.9" />}

      <g transform={BACK}>
      {/* Far range */}
      <path
        d="M0 420 L120 380 L230 400 L360 330 L470 370 L560 300 L650 350 L760 280 L860 330 L980 250 L1090 320 L1200 270 L1320 340 L1440 300 L1600 360 V700 H0Z"
        fill={c.far}
      />
      {/* Summit range */}
      <path
        d="M0 500 L140 450 L260 470 L400 400 L520 440 L640 360 L760 300 L860 250 L940 205 L1010 170 L1060 200 L1120 245 L1180 230 L1260 290 L1380 330 L1500 310 L1600 350 V700 H0Z"
        fill={c.midFar}
      />
      <path d="M940 205 L1010 170 L1060 200 L1036 213 L1012 197 L988 216 L962 207 Z" fill={c.snow} opacity="0.9" />
      <path d="M1120 245 L1180 230 L1214 256 L1190 252 L1170 262 L1146 252 Z" fill={c.snow} opacity="0.6" />
      </g>
      <rect x="0" y="160" width="1600" height="540" fill="url(#haze)" />
      {/* Middle range */}
      <path
        d="M0 560 L180 500 L320 540 L460 470 L600 520 L740 480 L880 540 L1040 470 L1200 520 L1360 460 L1500 500 L1600 480 V700 H0Z"
        fill={c.mid}
      />
      {/* Near forest */}
      <path d="M0 622 Q200 566 380 602 T760 592 T1160 612 T1600 574 V700 H0Z" fill={c.near} />
      <path d={TREES_BACK} fill={c.trees} />
      <path d={TREES_FRONT} fill={c.front} />
      <path d="M0 684 Q400 660 800 676 T1600 664 V700 H0Z" fill={c.front} />

      {trail && (
        <g>
          <path
            transform={BACK}
            d={TRAIL_D}
            fill="none"
            stroke="#F2B652"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="0.5 13"
            mask="url(#trail-reveal)"
          />
          <g
            transform={`translate(${SUMMIT.x} ${SUMMIT.y})`}
          >
            <g style={{ transformOrigin: "0px 0px", animation: "pop 520ms 3s cubic-bezier(0.22,0.8,0.24,1) both" }}>
              <line x1="0" y1="0" x2="0" y2="-48" stroke="#F6F8F7" strokeWidth="3" strokeLinecap="round" />
              <path d="M1 -46 L36 -34 L1 -22 Z" fill="#E2A23B" />
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}
