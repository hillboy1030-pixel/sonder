"use client";

export const dynamic = "force-dynamic";

export default function JournalPage() {
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

        {/* Header */}
        <div style={{ marginBottom: "52px" }}>
          <h1
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: "#2A2620",
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            The Sonder Journal
          </h1>
          <p
            style={{
              fontSize: "13px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#3D5A3E",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            Coming soon.
          </p>
          <p
            style={{
              fontSize: "clamp(15px, 1.7vw, 17px)",
              lineHeight: 1.75,
              color: "#4A4540",
            }}
          >
            Your digital report is a beginning. The Sonder Journal is where that beginning becomes
            a year of practice.
          </p>
        </div>

        {/* Section: What it is */}
        <div style={{ marginBottom: "44px" }}>
          <h2
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(18px, 2.2vw, 22px)",
              fontWeight: 600,
              color: "#2A2620",
              marginBottom: "16px",
            }}
          >
            What it is
          </h2>
          <p
            style={{
              fontSize: "clamp(15px, 1.7vw, 17px)",
              lineHeight: 1.75,
              color: "#4A4540",
            }}
          >
            A physical, hardcover book printed and shipped directly to you. Its pages contain a year
            of journaling prompts crafted specifically from your Sonder report — not generic
            self-help prompts, but questions only someone with your profile should be asked. Each
            month includes a curated reading, a practice to try, and space to write. It&rsquo;s
            designed to sit on your nightstand.
          </p>
        </div>

        {/* Section: How it will work */}
        <div style={{ marginBottom: "44px" }}>
          <h2
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: "clamp(18px, 2.2vw, 22px)",
              fontWeight: 600,
              color: "#2A2620",
              marginBottom: "16px",
            }}
          >
            How it will work
          </h2>
          <p
            style={{
              fontSize: "clamp(15px, 1.7vw, 17px)",
              lineHeight: 1.75,
              color: "#4A4540",
            }}
          >
            Once the journal launches, you&rsquo;ll be able to upload the PDF of your Sonder
            report, confirm your shipping information, and receive a printed book made from your own
            profile within 10 to 14 days. Your PDF is processed only to generate your journal —
            never stored.
          </p>
        </div>

        {/* Closing paragraph */}
        <p
          style={{
            fontSize: "clamp(15px, 1.7vw, 17px)",
            lineHeight: 1.75,
            color: "#4A4540",
            marginBottom: "56px",
          }}
        >
          The Sonder Journal is in development. It will launch when it&rsquo;s ready — when we can
          guarantee it feels as considered as the report itself. Come back when you&rsquo;re ready
          for the next step.
        </p>

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
      </main>
    </div>
  );
}
