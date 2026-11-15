import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProsePage } from "@/components/ProsePage";

export const metadata: Metadata = { title: "About — Sonder" };

export default function AboutPage() {
  return (
    <ProsePage kicker="A note from the builder" title="About Sonder">
      <div className="space-y-5">
        <p>
          Sonder was built by someone who has spent years thinking about why people make the
          decisions they do: in their careers, their relationships, the rooms they walk into and out
          of. A psychology background from the University of Minnesota, a career spent helping
          families make decisions about money and the future, and enough lived experience across
          different worlds to know that most people are walking around with patterns they&rsquo;ve
          never had the language to name.
        </p>
        <p>
          Sonder exists because self-understanding shouldn&rsquo;t cost hundreds of dollars. It should
          be something you can quietly give yourself on a Tuesday afternoon, and it should leave you
          feeling seen rather than assessed.
        </p>
        <p>
          The questions come from four well-studied research frameworks: the Big Five, Holland codes,
          attachment research, and the VIA character strengths. Your answers, and what you share about
          your life right now, are written into a report by an AI instructed to reflect patterns back
          with care, not certainty. What you do with it is yours.
        </p>
        <p className="font-read italic">
          Sonder is a tool for reflection, not a diagnosis or a replacement for a licensed
          professional.
        </p>
      </div>
      <Link href="/assessment" className="btn btn-primary mt-10">
        Start the climb
        <ArrowRight size={18} strokeWidth={2.25} aria-hidden="true" />
      </Link>
    </ProsePage>
  );
}
