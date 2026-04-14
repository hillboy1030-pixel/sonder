"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Scroll-triggered fade-in hook ───────────────────────────────────────────

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const steps = useFadeIn();
  const footer = useFadeIn();

  return (
    <div style={{ backgroundColor: "#F9F7F4", color: "#2A2620" }}>

      {/* ── Hero ── */}
      <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>

        {/* Parallax forest image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "130%",
            objectFit: "cover",
            objectPosition: "center top",
            transform: `translateY(${scrollY * 0.3}px)`,
            willChange: "transform",
          }}
        />

        {/* Gradient overlay — light at top, darker toward bottom for text readability */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.58) 100%)",
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "28px 40px",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.3px",
            }}
          >
            Sonder
          </span>
        </div>

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
            maxWidth: "880px",
            margin: "0 auto",
          }}
        >
          {/* Definition line */}
          <p
            style={{
              fontSize: "clamp(11px, 1.2vw, 13px)",
              letterSpacing: "0.13em",
              color: "rgba(255,255,255,0.65)",
              textTransform: "uppercase",
              marginBottom: "32px",
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              padding: "8px 16px",
              borderRadius: "4px",
              animationName: "fadeUp",
              animationDuration: "0.9s",
              animationTimingFunction: "ease-out",
              animationDelay: "0ms",
              animationFillMode: "both",
            }}
          >
            sonder (n.) — the realization that each passerby has a life as vivid and complex as your own.
          </p>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(28px, 4.8vw, 62px)",
              fontWeight: 700,
              color: "white",
              lineHeight: 1.18,
              marginBottom: "28px",
              animationName: "fadeUp",
              animationDuration: "0.9s",
              animationTimingFunction: "ease-out",
              animationDelay: "200ms",
              animationFillMode: "both",
            }}
          >
            How well do you actually know yourself?
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "clamp(15px, 1.8vw, 20px)",
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.55,
              marginBottom: "44px",
              maxWidth: "560px",
              animationName: "fadeUp",
              animationDuration: "0.9s",
              animationTimingFunction: "ease-out",
              animationDelay: "400ms",
              animationFillMode: "both",
            }}
          >
            Every decision you&rsquo;ve made — every relationship, every career move, every argument you couldn&rsquo;t let go — came from patterns you&rsquo;ve never seen clearly. Sonder makes them visible.
          </p>

          {/* CTA button */}
          <div
            style={{
              animationName: "fadeUp",
              animationDuration: "0.9s",
              animationTimingFunction: "ease-out",
              animationDelay: "600ms",
              animationFillMode: "both",
            }}
          >
            <HeroButton />
          </div>
        </div>

        {/* Scroll indicator — thin vertical line */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "36px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            animationName: "fadeUp",
            animationDuration: "1s",
            animationTimingFunction: "ease-out",
            animationDelay: "900ms",
            animationFillMode: "both",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "52px",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0))",
              margin: "0 auto",
            }}
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ backgroundColor: "#F9F7F4", padding: "100px 24px 80px" }}>
        <div ref={steps.ref} style={{ maxWidth: "680px", margin: "0 auto" }}>

          {/* Section heading */}
          <h2
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(24px, 3.5vw, 34px)",
              fontWeight: 600,
              textAlign: "center",
              color: "#2A2620",
              marginBottom: "64px",
              opacity: steps.visible ? 1 : 0,
              transform: steps.visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
            }}
          >
            How it works
          </h2>

          {/* Steps */}
          {STEPS.map((step, i) => (
            <div key={step.number}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr",
                  gap: "20px",
                  alignItems: "start",
                  padding: "40px 0",
                  opacity: steps.visible ? 1 : 0,
                  transform: steps.visible ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 0.7s ease-out ${i * 140 + 180}ms, transform 0.7s ease-out ${i * 140 + 180}ms`,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontSize: "clamp(36px, 4vw, 52px)",
                    fontWeight: 700,
                    color: "rgba(61,90,62,0.28)",
                    lineHeight: 1,
                    paddingTop: "2px",
                  }}
                >
                  {step.number}
                </span>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontSize: "clamp(17px, 2vw, 21px)",
                      fontWeight: 600,
                      color: "#2A2620",
                      marginBottom: "10px",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: "15px", color: "#8A8278", lineHeight: 1.7 }}>
                    {step.description}
                  </p>
                  {i === 2 && (
                    <p style={{ fontSize: "11px", color: "#8A8278", lineHeight: 1.8, marginTop: "12px" }}>
                      {"Who You Are · How You Work · How You Love · What Drives You · Your Growth Edges · Your Path Forward · The Sonder Lens · The Whole Picture"
                        .split(" · ")
                        .map((name, idx, arr) => (
                          <span key={name}>
                            {name}
                            {idx < arr.length - 1 && (
                              <span style={{ color: "#3D5A3E", margin: "0 5px" }}>·</span>
                            )}
                          </span>
                        ))}
                    </p>
                  )}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ height: "1px", background: "rgba(184,178,168,0.35)" }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        ref={footer.ref}
        style={{
          backgroundColor: "#F9F7F4",
          borderTop: "1px solid rgba(184,178,168,0.35)",
          padding: "44px 24px",
          textAlign: "center",
          opacity: footer.visible ? 1 : 0,
          transition: "opacity 0.8s ease-out",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#B8B2A8",
            marginBottom: "14px",
          }}
        >
          Based on IPIP-NEO, ECR-RS, O*NET, and VIA validated frameworks
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "#8A8278",
            maxWidth: "400px",
            margin: "0 auto",
            lineHeight: 1.65,
          }}
        >
          Your privacy is protected — we never store your responses or results on our servers.
        </p>
      </footer>
    </div>
  );
}

// ─── Hero CTA button — needs hover state so it's its own component ────────────

function HeroButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/assessment"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-block",
        padding: "16px 44px",
        borderRadius: "9999px",
        background: hovered ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.16)",
        border: "1.5px solid rgba(255,255,255,0.65)",
        color: hovered ? "#3D5A3E" : "white",
        fontWeight: 600,
        fontSize: "15px",
        letterSpacing: "0.04em",
        textDecoration: "none",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "background 0.22s, color 0.22s, transform 0.22s",
        boxShadow: hovered
          ? "0 8px 30px rgba(0,0,0,0.18)"
          : "0 2px 12px rgba(0,0,0,0.12)",
      }}
    >
      Begin Your Assessment
    </Link>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Take the assessment",
    description:
      "72 questions across four research-backed frameworks. Honest answers yield the most accurate picture.",
  },
  {
    number: "02",
    title: "Get your free preview",
    description:
      "See three insight cards from your results immediately — no payment required.",
  },
  {
    number: "03",
    title: "Unlock your full report",
    description:
      "For a one-time $5 payment, receive your complete eight-section psychological portrait.",
  },
];
