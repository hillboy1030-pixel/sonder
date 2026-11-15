import { Backpack, Compass, HeartHandshake, Mountain, Tent, type LucideProps } from "lucide-react";
import type { ChapterId } from "@/lib/chapters";

const ICONS = {
  basecamp: Tent,
  terrain: Mountain,
  path: Compass,
  company: HeartHandshake,
  carry: Backpack,
} as const;

export function ChapterIcon({ id, ...props }: { id: ChapterId } & LucideProps) {
  const Icon = ICONS[id];
  return <Icon aria-hidden="true" {...props} />;
}
