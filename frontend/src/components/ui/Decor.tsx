import { cn } from "@/lib/cn";

/**
 * Formes organiques floutées en arrière-plan (à la UNESCO/IFAD) — décoratives,
 * faible opacité, derrière le contenu. À placer dans un parent `relative overflow-hidden`.
 */
export function Blobs({
  variant = "warm",
  className,
}: {
  variant?: "warm" | "forest" | "dark" | "mixed";
  className?: string;
}) {
  const palette = {
    warm: ["bg-gold-400/25", "bg-cacao-300/30"],
    forest: ["bg-forest-400/25", "bg-forest-200/40"],
    dark: ["bg-gold-400/15", "bg-forest-500/15"],
    mixed: ["bg-gold-400/20", "bg-forest-300/25"],
  }[variant];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className={cn("absolute -left-32 -top-24 h-[28rem] w-[28rem] rounded-full blur-3xl", palette[0])} />
      <div className={cn("absolute -bottom-32 -right-24 h-[32rem] w-[32rem] rounded-full blur-3xl", palette[1])} />
    </div>
  );
}

/** Vague décorative en SVG (séparateur de sections). `flip` pour la retourner. */
export function Wave({
  className,
  color = "fill-cream",
  flip = false,
}: {
  className?: string;
  color?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1440 110"
      preserveAspectRatio="none"
      aria-hidden
      className={cn("block h-[60px] w-full sm:h-[90px]", flip && "rotate-180", color, className)}
    >
      <path d="M0,64 C240,110 480,10 720,32 C960,54 1200,110 1440,72 L1440,110 L0,110 Z" />
    </svg>
  );
}

/** Motif de pois discret (overlay sur fond sombre). */
export function DotGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 opacity-[0.06]", className)}
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    />
  );
}
