import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "cream" | "white" | "sand" | "dark" | "forest";

const TONES: Record<Tone, string> = {
  cream: "bg-cream text-cacao-950",
  white: "bg-white text-cacao-950",
  sand: "bg-sand text-cacao-950",
  dark: "bg-cacao-950 text-cream",
  forest: "bg-forest-700 text-cream",
};

type SectionProps = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  /** padding vertical : "lg" (défaut), "md", "sm" */
  spacing?: "sm" | "md" | "lg";
  id?: string;
};

const SPACING = { sm: "py-14 sm:py-20", md: "py-20 sm:py-24", lg: "py-24 sm:py-32" };

export function Section({ children, tone = "cream", className, spacing = "lg", id }: SectionProps) {
  return (
    <section id={id} className={cn(TONES[tone], SPACING[spacing], className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}

type HeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
  invert?: boolean;
};

export function SectionHeading({ eyebrow, title, intro, align = "left", className, invert }: HeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span className={cn("eyebrow", invert && "text-gold-300")}>
          <span className="h-px w-6 bg-current opacity-60" aria-hidden />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "mt-3 font-display text-[clamp(1.7rem,2.6vw,2.4rem)] font-semibold leading-[1.15] text-balance",
          invert ? "text-cream" : "text-cacao-950",
        )}
      >
        {title}
      </h2>
      {intro ? (
        <p className={cn("mt-4 text-pretty text-lg leading-relaxed", invert ? "text-cream/80" : "text-cacao-900/80")}>{intro}</p>
      ) : null}
    </div>
  );
}
