"use client";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#F9F7F4", color: "#2A2620", minHeight: "100vh" }}>

      {/* Nav */}
      <header style={{ padding: "28px 40px", borderBottom: "1px solid rgba(184,178,168,0.28)" }}>
        <a
          href="/"
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "28px",
            fontWeight: 700,
            color: "#3D5A3E",
            letterSpacing: "-0.3px",
            textDecoration: "none",
          }}
        >
          Sonder
        </a>
      </header>

      <main style={{ maxWidth: "620px", margin: "0 auto", padding: "72px 24px 96px" }}>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            color: "#2A2620",
            marginBottom: "48px",
            lineHeight: 1.2,
          }}
        >
          About Sonder
        </h1>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <p
            style={{
              fontSize: "clamp(15px, 1.7vw, 17px)",
              lineHeight: 1.75,
              color: "#4A4540",
            }}
          >
            Sonder was built by someone who has spent years thinking about why people make the
            decisions they do — in their careers, their relationships, the rooms they walk into and
            out of. A psychology background from the University of Minnesota, a career in financial
            advising helping families navigate money and mortality, and enough lived experience
            across enough different worlds to know that most people are walking around with patterns
            they have never had the language to name.
          </p>

          <p
            style={{
              fontSize: "clamp(15px, 1.7vw, 17px)",
              lineHeight: 1.75,
              color: "#4A4540",
            }}
          >
            Sonder exists because self-understanding shouldn&rsquo;t cost hundreds of dollars or
            require a therapist. It should be something you can quietly give yourself on a Tuesday
            afternoon. Something that makes you feel seen instead of assessed.
          </p>

          <p
            style={{
              fontSize: "clamp(15px, 1.7vw, 17px)",
              lineHeight: 1.75,
              color: "#4A4540",
            }}
          >
            The report you receive is built on four validated research frameworks — the Big Five,
            the Holland Code, attachment theory, and the VIA strengths inventory — synthesized by an
            AI trained to reflect patterns back with care, not certainty. What you do with it is
            yours.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(184,178,168,0.35)", margin: "56px 0 44px" }} />

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", marginBottom: "0" }}>
          <a
            href="/assessment"
            style={{
              display: "inline-block",
              padding: "18px 56px",
              borderRadius: "9999px",
              background: "#3D5A3E",
              color: "#F5F0E8",
              fontWeight: 600,
              fontSize: "17px",
              letterSpacing: "0.03em",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#4a6e4b")}
            onMouseLeave={e => (e.currentTarget.style.background = "#3D5A3E")}
          >
            Begin your sonder →
          </a>

          {/* Back link */}
          <a
            href="/"
            style={{
              fontSize: "13px",
              color: "#8A8278",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#2A2620")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8A8278")}
          >
            ← Return home
          </a>
        </div>
      </main>
    </div>
  );
}
