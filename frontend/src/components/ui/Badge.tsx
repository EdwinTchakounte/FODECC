import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "forest" | "gold" | "cacao" | "light";

const TONES: Record<Tone, string> = {
  forest: "bg-forest-100 text-forest-800",
  gold: "bg-gold-300/40 text-cacao-900",
  cacao: "bg-cacao-100 text-cacao-800",
  light: "bg-white/15 text-cream backdrop-blur-sm",
};

export default function Badge({
  children,
  tone = "forest",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
