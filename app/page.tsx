"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Scroll-triggered fade-in hook ───────────────────────────────────────────

function useFadeIn(threshold = 0.12) {
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

// ─── SVG Ink Divider — stroke fades to nothing at both ends ──────────────────

function InkDivider({ width = 320, style }: { width?: number; style?: React.CSSProperties }) {
  const id = `fade-${width}`;
  return (
    <svg
      width={width}
      height="24"
      viewBox={`0 0 ${width} 24`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", ...style }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#8A9383" stopOpacity="0" />
          <stop offset="25%"  stopColor="#8A9383" stopOpacity="0.55" />
          <stop offset="75%"  stopColor="#8A9383" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#8A9383" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1="0"
        y1="12"
        x2={width}
        y2="12"
        stroke={`url(#${id})`}
        strokeWidth="0.75"
      />
    </svg>
  );
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
          src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=2400&q=85"
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

        {/* Gradient overlay — dark at bottom for readability, lighter at top */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.30) 35%, rgba(0,0,0,0.62) 100%)",
          }}
        />

        {/* Hero-to-content fade transition */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "140px",
            background: "linear-gradient(to bottom, transparent 0%, #F9F7F4 100%)",
            zIndex: 5,
          }}
        />

        {/* Nav */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "28px 40px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Wordmark — left */}
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

          {/* Nav links — right on mobile, centered on sm+ */}
          <div className="flex sm:hidden" style={{ gap: "10px" }}>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/journal">The Journal</NavLink>
          </div>
          <div
            className="hidden sm:flex"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              gap: "16px",
            }}
          >
            <NavLink href="/about">About</NavLink>
            <NavLink href="/journal">The Journal</NavLink>
          </div>
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
            padding: "80px 24px 80px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          {/* Definition treatment — label, thin rule, italic text */}
          <div
            style={{
              marginBottom: "56px",
              textAlign: "center",
              animationName: "fadeUp",
              animationDuration: "1s",
              animationTimingFunction: "ease-out",
              animationDelay: "0ms",
              animationFillMode: "both",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "9px",
                letterSpacing: "0.32em",
                color: "rgba(249,247,244,0.5)",
                textTransform: "uppercase",
                fontWeight: 500,
                marginBottom: "14px",
              }}
            >
              Sonder &nbsp;·&nbsp; n.
            </p>
            {/* Thin rule */}
            <div
              style={{
                width: "40px",
                height: "0.5px",
                background: "rgba(249,247,244,0.3)",
                margin: "0 auto 18px",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-eb-garamond), Georgia, serif",
                fontStyle: "italic",
                fontSize: "clamp(15px, 1.5vw, 18px)",
                color: "rgba(249,247,244,0.65)",
                lineHeight: 1.65,
                maxWidth: "420px",
                margin: "0 auto",
                fontWeight: 400,
              }}
            >
              the realization that each passerby has a life as vivid and complex as your own.
            </p>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(4rem, 10vw, 7rem)",
              fontWeight: 300,
              color: "rgba(249,247,244,0.97)",
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              marginBottom: "44px",
              animationName: "fadeUp",
              animationDuration: "1s",
              animationTimingFunction: "ease-out",
              animationDelay: "200ms",
              animationFillMode: "both",
            }}
          >
            Come inward.
          </h1>

          {/* Body paragraph */}
          <p
            style={{
              fontFamily: "var(--font-eb-garamond), Georgia, serif",
              fontSize: "clamp(15px, 1.45vw, 18px)",
              color: "rgba(249,247,244,0.78)",
              lineHeight: 1.75,
              marginBottom: "56px",
              maxWidth: "540px",
              fontWeight: 400,
              animationName: "fadeUp",
              animationDuration: "1s",
              animationTimingFunction: "ease-out",
              animationDelay: "400ms",
              animationFillMode: "both",
            }}
          >
            A 72-question assessment grounded in validated psychology. A nine-section portrait of how you think, work, love, and grow. Your answers never leave your browser.
          </p>

          {/* CTA button */}
          <div
            style={{
              animationName: "fadeUp",
              animationDuration: "1s",
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
            bottom: "52px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            animationName: "fadeUp",
            animationDuration: "1s",
            animationTimingFunction: "ease-out",
            animationDelay: "1000ms",
            animationFillMode: "both",
          }}
        >
          <div
            style={{
              width: "1px",
              height: "48px",
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0))",
              margin: "0 auto",
            }}
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ background: "#F9F7F4", padding: "120px 24px 96px" }}>
        <div ref={steps.ref} style={{ maxWidth: "640px", margin: "0 auto" }}>

          {/* Section heading */}
          <h2
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              fontWeight: 400,
              textAlign: "center",
              color: "#3C3530",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              marginBottom: "80px",
              opacity: steps.visible ? 1 : 0,
              transform: steps.visible ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
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
                  gridTemplateColumns: "80px 1fr",
                  gap: "24px",
                  alignItems: "start",
                  padding: "44px 0",
                  opacity: steps.visible ? (step.comingSoon ? 0.5 : 1) : 0,
                  transform: steps.visible ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 0.8s ease-out ${i * 150 + 200}ms, transform 0.8s ease-out ${i * 150 + 200}ms`,
                }}
              >
                {/* Step numeral */}
                <span
                  style={{
                    fontFamily: "var(--font-playfair), Georgia, serif",
                    fontSize: "clamp(3.5rem, 6vw, 5rem)",
                    fontWeight: 300,
                    color: step.comingSoon ? "rgba(138,147,131,0.18)" : "rgba(138,147,131,0.38)",
                    lineHeight: 1,
                    paddingTop: "4px",
                  }}
                >
                  {step.number}
                </span>
                <div>
                  {step.comingSoon && (
                    <p
                      style={{
                        fontFamily: "var(--font-inter), system-ui, sans-serif",
                        fontSize: "9px",
                        fontStyle: "italic",
                        letterSpacing: "0.14em",
                        color: "#8A9383",
                        opacity: 0.7,
                        marginBottom: "10px",
                        textTransform: "uppercase",
                      }}
                    >
                      Coming soon
                    </p>
                  )}
                  <h3
                    style={{
                      fontFamily: "var(--font-playfair), Georgia, serif",
                      fontSize: "clamp(18px, 2.1vw, 24px)",
                      fontWeight: 500,
                      color: step.comingSoon ? "#7A6E67" : "#3C3530",
                      marginBottom: "12px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-eb-garamond), Georgia, serif",
                      fontSize: "clamp(16px, 1.7vw, 18px)",
                      color: "#7A6E67",
                      lineHeight: 1.8,
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Custom SVG divider between steps */}
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    opacity: steps.visible ? 1 : 0,
                    transition: `opacity 0.8s ease-out ${i * 150 + 300}ms`,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <InkDivider width={240} />
                </div>
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
          padding: "64px 24px 56px",
          textAlign: "center",
          opacity: footer.visible ? 1 : 0,
          transition: "opacity 0.9s ease-out",
        }}
      >
        {/* Footer ink divider */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "44px" }}>
          <InkDivider width={200} />
        </div>

        <p
          style={{
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8A9383",
            marginBottom: "16px",
          }}
        >
          Based on IPIP-NEO, ECR-RS, O*NET, and VIA validated frameworks
        </p>
        <p
          style={{
            fontFamily: "var(--font-eb-garamond), Georgia, serif",
            fontStyle: "italic",
            fontSize: "15px",
            color: "#7A6E67",
            maxWidth: "380px",
            margin: "0 auto",
            lineHeight: 1.75,
          }}
        >
          Your privacy is protected — we never store your responses or results on our servers.
        </p>
        <div style={{ marginTop: "24px", display: "flex", gap: "28px", justifyContent: "center" }}>
          <a
            href="/terms"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8A9383",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#5C524B")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8A9383")}
          >
            Terms of Service
          </a>
          <a
            href="/privacy"
            style={{
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8A9383",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#5C524B")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8A9383")}
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}

// ─── Hero CTA button ──────────────────────────────────────────────────────────

function HeroButton() {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href="/assessment"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-block",
        padding: "18px 56px",
        borderRadius: "9999px",
        background: hovered ? "rgba(249,247,244,0.08)" : "transparent",
        border: "1px solid rgba(249,247,244,0.65)",
        color: "rgba(249,247,244,0.92)",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontWeight: 500,
        fontSize: "15px",
        letterSpacing: "0.12em",
        textDecoration: "none",
        textTransform: "uppercase",
        transition: "background 0.4s ease-out, border-color 0.4s ease-out",
        borderColor: hovered ? "rgba(249,247,244,0.85)" : "rgba(249,247,244,0.65)",
      }}
    >
      Begin
    </Link>
  );
}

// ─── Nav link — frosted pill ──────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-block",
        padding: "7px 18px",
        borderRadius: "9999px",
        background: hovered ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.16)",
        border: "1.5px solid rgba(255,255,255,0.65)",
        color: hovered ? "#3D5A3E" : "white",
        fontWeight: 600,
        fontSize: "11px",
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
      {children}
    </a>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Take the assessment",
    description:
      "72 questions across four research-backed frameworks. Takes about 10 minutes. Honest answers yield the most accurate picture.",
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
      "For a one-time payment, receive your complete Sonder Report — nine sections of precise, personal psychological reflection.",
  },
  {
    number: "04",
    title: "The Sonder Journal",
    description:
      "Your report becomes a physical book — thick paper, a full year of prompts crafted from your profile, designed to sit on your nightstand. Not more content. Just a quiet invitation to keep sondering.",
    comingSoon: true,
  },
];
