"use client";

// The hero's dotted trail, drawn by scrolling. Scroll down and the trail climbs
// toward the summit with a small light walking its tip; scroll up and it
// retreats. With reduced motion, the whole trail is simply shown.

import { useEffect, useRef } from "react";

const START = 0.14; // a little trail is always showing

export function ScrollTrail({ d, summit }: { d: string; summit: { x: number; y: number } }) {
  const maskPath = useRef<SVGPathElement>(null);
  const walker = useRef<SVGGElement>(null);
  const flag = useRef<SVGGElement>(null);

  useEffect(() => {
    const path = maskPath.current;
    const svg = path?.ownerSVGElement;
    if (!path || !svg) return;
    const length = path.getTotalLength();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let shown = -1;

    const draw = (p: number) => {
      if (Math.abs(p - shown) < 0.002) return;
      shown = p;
      path.style.strokeDasharray = `${p * length} ${length}`;
      const w = walker.current;
      if (w) {
        const pt = path.getPointAtLength(p * length);
        w.setAttribute("transform", `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
        w.style.opacity = p > 0.97 || reduce ? "0" : "1";
      }
      flag.current?.classList.toggle("flag-reached", p > 0.97);
    };

    const update = () => {
      frame = 0;
      const rect = svg.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 as the scene enters the bottom of the screen; 1 once its base is
      // three quarters of the way up the screen.
      const raw = (vh - rect.top) / (vh * 0.25 + rect.height);
      draw(Math.min(1, Math.max(START, raw)));
    };

    if (reduce) {
      draw(1);
      return;
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <g>
      <defs>
        <mask id="trail-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="700">
          <path
            ref={maskPath}
            d={d}
            fill="none"
            stroke="white"
            strokeWidth="16"
            strokeLinecap="round"
            style={{ strokeDasharray: `${START * 1400} 3000`, transition: "stroke-dasharray 120ms linear" }}
          />
        </mask>
        <radialGradient id="walker-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE7B0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F4C46F" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="#F2B652"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeDasharray="0.5 13"
        mask="url(#trail-reveal)"
      />
      <g ref={walker} style={{ transition: "opacity 300ms ease" }}>
        <circle r="22" fill="url(#walker-glow)" />
        <circle r="6" fill="#FFF3D3" />
      </g>
      <g transform={`translate(${summit.x} ${summit.y})`}>
        <g ref={flag} className="summit-flag">
          <line x1="0" y1="0" x2="0" y2="-48" stroke="#F6F8F7" strokeWidth="3" strokeLinecap="round" />
          <path d="M1 -46 L36 -34 L1 -22 Z" fill="#E2A23B" />
        </g>
      </g>
    </g>
  );
}
