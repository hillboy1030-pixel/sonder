import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, ProseSection } from "@/components/ProsePage";
import { REPORT_PRICE_LABEL } from "@/lib/pricing";

export const metadata: Metadata = { title: "Terms — Sonder" };

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Service" updated="November 2026">
      <ProseSection title="What Sonder is">
        <p>
          Sonder is a self-reflection tool for personal insight and general education. Its questions
          are drawn from published psychological research frameworks, including the IPIP-NEO, ECR,
          O*NET Holland codes, and VIA character strengths. Sonder is{" "}
          <strong className="text-ink">not</strong> a clinical assessment, a medical device, a
          diagnostic tool, or a substitute for professional mental health care, therapy, or
          counseling.
        </p>
        <p>
          Nothing on this site or in your report is medical advice, a psychiatric diagnosis, or
          treatment. If you&rsquo;re experiencing emotional distress or a mental health crisis, please
          contact a licensed professional. In the US you can call or text{" "}
          <a href="tel:988" className="font-semibold text-pine underline underline-offset-4">988</a>{" "}
          any time.
        </p>
      </ProseSection>

      <ProseSection title="Age">
        <p>By using Sonder you confirm you are at least 18 years old.</p>
      </ProseSection>

      <ProseSection title="Your data">
        <p>
          Your answers and results are stored in your own browser. See the{" "}
          <Link href="/privacy" className="font-semibold text-pine underline underline-offset-4">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
      </ProseSection>

      <ProseSection title="Payment">
        <p>
          The full report is a one-time payment of {REPORT_PRICE_LABEL}, processed by Stripe. Because
          the report is written and delivered digitally right away, sales are final once it has been
          generated. If something goes wrong and your report doesn&rsquo;t arrive, email us and
          we&rsquo;ll make it right.
        </p>
      </ProseSection>

      <ProseSection title="How to read your results">
        <p>
          Your report reflects tendencies, not certainties. No assessment is fully accurate for any one
          person. Treat it as a starting point for reflection, not a final word on who you are.
        </p>
      </ProseSection>

      <ProseSection title="Ownership">
        <p>
          The site, design, and copy belong to Sonder. Your report is for your personal use and
          may not be resold or published commercially without permission.
        </p>
      </ProseSection>

      <ProseSection title="Changes and contact">
        <p>
          We may update these terms. Continued use after changes means you accept them. Questions?
          Email{" "}
          <a href="mailto:hello@sonder-me.com" className="font-semibold text-pine underline underline-offset-4">
            hello@sonder-me.com
          </a>
          .
        </p>
      </ProseSection>
    </ProsePage>
  );
}
