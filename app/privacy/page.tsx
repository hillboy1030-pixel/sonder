export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: "#F9F7F4", minHeight: "100vh", color: "#2A2620" }}>
      <header style={{ padding: "28px 40px", borderBottom: "1px solid rgba(184,178,168,0.35)" }}>
        <a
          href="/"
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "28px",
            fontWeight: 700,
            color: "#3D5A3E",
            textDecoration: "none",
          }}
        >
          Sonder
        </a>
      </header>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 24px 80px" }}>
        <h1
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: "clamp(24px, 3.5vw, 34px)",
            fontWeight: 600,
            color: "#2A2620",
            marginBottom: "8px",
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ fontSize: "13px", color: "#8A8278", marginBottom: "40px" }}>
          Last updated: April 2025
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <Section title="1. What We Collect">
            Sonder is designed to collect as little data as possible. When you take the assessment,
            your answers and scores are stored only in your browser&apos;s local storage — they
            are never sent to or stored on our servers. The only server-side operation is a
            stateless API call to generate your report; once the report is returned to your browser,
            we retain nothing on our end.
          </Section>

          <Section title="2. What We Do Not Collect">
            We do not collect your name, email address, IP address, or any identifying information
            as part of the assessment experience. We do not use tracking cookies, advertising
            pixels, or behavioral analytics tools. We do not build profiles of users.
          </Section>

          <Section title="3. Payment Information">
            Payment is processed by Stripe, a third-party payment processor. Sonder never sees or
            stores your credit card details. Stripe may collect information in accordance with
            their own privacy policy. We receive only a confirmation that payment was successful.
          </Section>

          <Section title="4. Local Storage">
            Your assessment responses, scores, context answers, and generated report are stored in
            your browser&apos;s local storage under the keys{" "}
            <code
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                backgroundColor: "rgba(61,90,62,0.08)",
                padding: "1px 5px",
                borderRadius: "3px",
              }}
            >
              sonder_scores
            </code>
            ,{" "}
            <code
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                backgroundColor: "rgba(61,90,62,0.08)",
                padding: "1px 5px",
                borderRadius: "3px",
              }}
            >
              sonder_context
            </code>
            , and{" "}
            <code
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                backgroundColor: "rgba(61,90,62,0.08)",
                padding: "1px 5px",
                borderRadius: "3px",
              }}
            >
              sonder_report
            </code>
            . This data lives only on your device and is cleared when you clear your browser data.
            We cannot access it.
          </Section>

          <Section title="5. Third-Party Services">
            Sonder uses Anthropic&apos;s Claude API to generate your report. Your assessment scores
            and context answers are sent to Anthropic&apos;s API in a stateless request to produce
            your report. Anthropic may process this data in accordance with their API usage
            policies. We do not send any personally identifying information in this request.
            Stripe processes payment transactions. Vercel hosts the application infrastructure.
          </Section>

          <Section title="6. Children's Privacy">
            Sonder is not intended for use by anyone under the age of 18. We do not knowingly
            collect any information from minors.
          </Section>

          <Section title="7. Changes to This Policy">
            We may update this Privacy Policy from time to time. The date at the top of this page
            reflects the most recent revision. Continued use of Sonder after changes are posted
            constitutes acceptance of the updated policy.
          </Section>
        </div>

        <p style={{ marginTop: "48px", fontSize: "13px", color: "#8A8278" }}>
          Questions? Contact us at{" "}
          <a href="mailto:hello@sonder-me.com" style={{ color: "#3D5A3E" }}>
            hello@sonder-me.com
          </a>
        </p>
      </main>

      <footer style={{ borderTop: "1px solid rgba(184,178,168,0.35)", padding: "28px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
          <a href="/terms" style={{ fontSize: "12px", color: "#B8B2A8", textDecoration: "none" }}>
            Terms of Service
          </a>
          <a href="/privacy" style={{ fontSize: "12px", color: "#B8B2A8", textDecoration: "none" }}>
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2
        style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: "17px",
          fontWeight: 600,
          color: "#2A2620",
          marginBottom: "10px",
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: "15px", color: "#5A5450", lineHeight: 1.75 }}>{children}</p>
    </div>
  );
}
