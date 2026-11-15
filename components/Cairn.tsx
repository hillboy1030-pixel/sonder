"use client";

import { cairnLayout, stonePath, CAIRN_TOTAL_HEIGHT, type Stone } from "@/lib/cairn";
import { Ember } from "./Ember";

/**
 * Your cairn. `dropLast` animates the newest stone landing on top.
 * When `complete`, Ember's lantern sits on the summit stone.
 */
export function Cairn({
  stones,
  size = 200,
  dropLast = false,
  complete = false,
  ghosts = 0,
  className = "",
}: {
  stones: Stone[];
  size?: number;
  dropLast?: boolean;
  complete?: boolean;
  /** Outlines for stones still to come. */
  ghosts?: number;
  className?: string;
}) {
  const layout = cairnLayout(stones);
  const ghostLayout = cairnLayout([...stones, ...Array.from({ length: ghosts }, (_, i) => ({ ...stones[0], seed: 7 + i * 31 }))]).slice(stones.length);
  const lanternH = complete ? 64 : 0;
  const vbH = CAIRN_TOTAL_HEIGHT + 30 + lanternH;
  const top = layout.length ? layout[layout.length - 1] : null;

  return (
    <svg viewBox={`-90 ${-vbH + 14} 180 ${vbH}`} width={size} height={(size * vbH) / 180} className={className} role="img" aria-label={`A cairn of ${stones.length} stones: ${stones.map((s) => s.word).join(", ")}`}>
      <ellipse cx="0" cy="6" rx="86" ry="7" fill="#1C2521" opacity="0.12" />
      {ghostLayout.map((g, i) => (
        <path
          key={`g${i}`}
          d={stonePath(g.w, g.h, g.stone.seed)}
          transform={`translate(${g.cx} ${g.cy}) rotate(${g.tilt})`}
          fill="none"
          stroke="#7B8883"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
      ))}
      {layout.map((l, i) => {
        const isNew = dropLast && i === layout.length - 1;
        return (
          <g key={l.stone.chapter} className={isNew ? "stone-drop" : undefined} style={isNew ? { animationDelay: "250ms" } : undefined}>
            <g transform={`translate(${l.cx} ${l.cy}) rotate(${l.tilt})`}>
              <path d={stonePath(l.w, l.h, l.stone.seed)} fill={l.stone.color} />
              <path
                d={stonePath(l.w * 0.82, l.h * 0.5, l.stone.seed + 3)}
                transform={`translate(${-l.w * 0.05} ${-l.h * 0.18})`}
                fill="#FFFFFF"
                opacity="0.13"
              />
              <path d={stonePath(l.w, l.h, l.stone.seed)} fill="none" stroke="#1C2521" strokeOpacity="0.18" strokeWidth="1.5" />
            </g>
          </g>
        );
      })}
      {complete && top && (
        <foreignObject x={-30 + top.cx} y={top.cy - top.h / 2 - 66} width="60" height="68">
          <div className="stone-drop" style={{ animationDelay: "500ms" }}>
            <Ember mood="celebrating" size={60} />
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
