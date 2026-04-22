"use client";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#F9F7F4", color: "#3C3530", minHeight: "100vh" }}>

      {/* Nav */}
      <header style={{ padding: "28px 40px", borderBottom: "1px solid #E8E3DC" }}>
        <a
          href="/"
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "28px",
            fontWeight: 700,
            color: "#5A7250",
            letterSpacing: "-0.3px",
            textDecoration: "none",
          }}
        >
          Sonder
        </a>
      </header>

      <main style={{ maxWidth: "580px", margin: "0 auto", padding: "72px 24px 96px" }}>

        {/* Kicker */}
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8A9383",
            fontStyle: "italic",
            marginBottom: "28px",
          }}
        >
          A note from the builder
        </p>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            color: "#3C3530",
            marginBottom: "56px",
            lineHeight: 1.2,
          }}
        >
          About Sonder
        </h1>

        {/* Body */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <p
            style={{
              fontFamily: "var(--font-eb-garamond), Georgia, serif",
              fontSize: "clamp(17px, 1.9vw, 20px)",
              lineHeight: 1.8,
              color: "#3C3530",
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
              fontFamily: "var(--font-eb-garamond), Georgia, serif",
              fontSize: "clamp(17px, 1.9vw, 20px)",
              lineHeight: 1.8,
              color: "#3C3530",
            }}
          >
            Sonder exists because self-understanding shouldn&rsquo;t cost hundreds of dollars or
            require a therapist. It should be something you can quietly give yourself on a Tuesday
            afternoon. Something that makes you feel seen instead of assessed.
          </p>

          <p
            style={{
              fontFamily: "var(--font-eb-garamond), Georgia, serif",
              fontSize: "clamp(17px, 1.9vw, 20px)",
              lineHeight: 1.8,
              color: "#3C3530",
            }}
          >
            The report you receive is built on four validated research frameworks — the Big Five,
            the Holland Code, attachment theory, and the VIA strengths inventory — synthesized by an
            AI trained to reflect patterns back with care, not certainty. What you do with it is
            yours.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "#E8E3DC", margin: "64px 0 52px" }} />

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <a
            href="/assessment"
            style={{
              display: "inline-block",
              padding: "18px 64px",
              borderRadius: "9999px",
              background: "transparent",
              border: "1px solid rgba(90,114,80,0.55)",
              color: "#5A7250",
              fontWeight: 500,
              fontSize: "17px",
              letterSpacing: "0.04em",
              textDecoration: "none",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(90,114,80,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            Begin your sonder →
          </a>

          {/* Back link */}
          <a
            href="/"
            style={{
              fontSize: "13px",
              color: "#8A9383",
              textDecoration: "none",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#3C3530")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8A9383")}
          >
            ← Return home
          </a>
        </div>
      </main>
    </div>
  );
}
