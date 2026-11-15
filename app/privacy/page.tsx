import type { Metadata } from "next";
import { ProsePage, ProseSection } from "@/components/ProsePage";

export const metadata: Metadata = { title: "Privacy — Sonder" };

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy Policy" updated="November 2026">
      <ProseSection title="The short version">
        <p>
          Sonder is built to collect as little as possible. Your answers live in your browser. We
          don&rsquo;t ask for your name, we don&rsquo;t use tracking cookies or ad pixels, and we
          don&rsquo;t build profiles.
        </p>
      </ProseSection>

      <ProseSection title="Your answers and report">
        <p>
          Your assessment answers, scores, what you share at basecamp, and your generated insights and
          report are stored in your browser&rsquo;s local storage on your own device. They&rsquo;re
          removed when you clear your browser data. We can&rsquo;t see or recover them.
        </p>
        <p>
          To write your insights and report, your scores and basecamp answers are sent to
          Anthropic&rsquo;s Claude API in a single request. That request doesn&rsquo;t include your
          name or email. We don&rsquo;t store the request or the response on our servers. Anthropic
          handles API data under its own commercial terms and privacy policy.
        </p>
      </ProseSection>

      <ProseSection title="Payments">
        <p>
          Payments are handled by Stripe. We never see or store your card details. Stripe tells us
          whether a payment succeeded, and we record on that payment how many times it has been used to
          write a report, so one purchase can&rsquo;t be reused indefinitely. Stripe may collect
          information under its own privacy policy.
        </p>
      </ProseSection>

      <ProseSection title="The journal waitlist">
        <p>
          If you join the journal waitlist, we store your email address with our payment provider,
          Stripe, tagged as a waitlist sign-up. We use it only to tell you when the journal is
          available. To be removed, email us and we&rsquo;ll delete it.
        </p>
      </ProseSection>

      <ProseSection title="Service providers">
        <p>Anthropic writes the reports. Stripe processes payments and holds the waitlist. Vercel hosts the site.</p>
      </ProseSection>

      <ProseSection title="Age">
        <p>Sonder is for adults 18 and older. We don&rsquo;t knowingly collect information from anyone under 18.</p>
      </ProseSection>

      <ProseSection title="Changes and contact">
        <p>
          We may update this policy. The date at the top shows the latest version. Questions? Email{" "}
          <a href="mailto:hello@sonder-me.com" className="font-semibold text-pine underline underline-offset-4">
            hello@sonder-me.com
          </a>
          .
        </p>
      </ProseSection>
    </ProsePage>
  );
}
