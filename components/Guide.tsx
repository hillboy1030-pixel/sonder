"use client";

// Your guide, Ember: the voice that walks with each person through Sonder.
// See components/Ember.tsx for the character itself.

import { EmberAvatar, type EmberMood } from "./Ember";

export function GuideMark({ size = 44, mood = "calm", className = "" }: { size?: number; mood?: EmberMood; className?: string }) {
  return <EmberAvatar size={size} mood={mood} className={className} />;
}

/**
 * A line spoken by the guide. `tone` matches the surface it sits on.
 */
export function GuideLine({
  children,
  tone = "light",
  size = "md",
  mood = "calm",
  label = "Ember, your guide",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  mood?: EmberMood;
  label?: string | null;
  className?: string;
}) {
  const text =
    size === "lg" ? "text-[1.3rem] sm:text-[1.45rem] leading-[1.5]" : size === "sm" ? "text-[1rem] leading-relaxed" : "text-[1.12rem] leading-[1.6]";
  return (
    <figure className={`flex items-start gap-3.5 ${className}`}>
      <GuideMark size={size === "lg" ? 60 : size === "sm" ? 42 : 50} mood={mood} />
      <div className="min-w-0 pt-0.5">
        {label && (
          <figcaption className={`font-sign text-sm font-semibold ${tone === "dark" ? "text-gold-hi" : "text-pine-2"}`}>{label}</figcaption>
        )}
        <blockquote className={`mt-0.5 font-read italic ${text} ${tone === "dark" ? "text-snow/90" : "text-ink"}`}>{children}</blockquote>
      </div>
    </figure>
  );
}
