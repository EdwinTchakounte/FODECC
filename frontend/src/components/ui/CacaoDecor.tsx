import { cn } from "@/lib/cn";

/**
 * Décor « filière cacao / café » : cabosses, fèves, feuilles, motifs artisanaux
 * en arrière-plan, faible opacité, en `currentColor` (suit la couleur de texte
 * de la section). À placer dans un parent `relative overflow-hidden`.
 *
 * variants :
 *   - "hero"   : grandes cabosses + feuilles aux angles (bandeaux sombres)
 *   - "soft"   : éléments discrets, opacité très basse (sections claires)
 *   - "corner" : un motif unique dans un coin
 */
function CocoaPod({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} fill="none" aria-hidden>
      <path d="M60 6c26 14 40 48 40 92s-14 84-40 96c-26-12-40-52-40-96S34 20 60 6Z" stroke="currentColor" strokeWidth="3" />
      <path d="M60 6c0 10-1 178 0 188M40 20c4 12 4 152 0 168M80 20c-4 12-4 152 0 168M24 60c8 8 8 84 0 92M96 60c-8 8-8 84 0 92" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}
function CoffeeBean({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 70" className={className} fill="none" aria-hidden>
      <ellipse cx="50" cy="35" rx="46" ry="32" stroke="currentColor" strokeWidth="3" />
      <path d="M50 5c-14 12-14 48 0 60M50 5c14 12 14 48 0 60" stroke="currentColor" strokeWidth="2.5" opacity="0.7" />
    </svg>
  );
}
function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} fill="none" aria-hidden>
      <path d="M60 4C24 40 4 110 24 180c8 8 64 8 72 0 20-70 0-140-36-176Z" stroke="currentColor" strokeWidth="3" />
      <path d="M60 8v176M60 60c-14 6-26 18-32 32M60 60c14 6 26 18 32 32M60 110c-12 5-22 15-27 27M60 110c12 5 22 15 27 27" stroke="currentColor" strokeWidth="2" opacity="0.55" />
    </svg>
  );
}
/** Petit motif artisanal en pointillé (clin d'œil à la vannerie / aux paniers). */
function Weave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx="100" cy="100" r={28 + i * 22} stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 9" />
      ))}
    </svg>
  );
}

/**
 * Motif « doodle » répété — outils agricoles, plantes, cabosses, fèves —
 * dans l'esprit du fond de discussion WhatsApp. À poser en fond de section,
 * faible opacité, dans un parent `relative overflow-hidden`.
 */
export function ToolsPattern({ className, opacity = 0.05 }: { className?: string; opacity?: number }) {
  const id = "fodecc-tools";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)} style={{ opacity }}>
      <svg className="h-full w-full" aria-hidden>
        <defs>
          <pattern id={id} width="170" height="170" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
            <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 18l24 24M40 28l11 11-7 7-11-11z" />{/* houe */}
              <path d="M126 52V30M126 32c-9 0-15-5-16-13 9 0 15 5 16 13zM126 32c9 0 15-5 16-13-9 0-15 5-16 13z" />{/* pousse */}
              <path d="M26 116h28l-3 26H29zM54 122l18-9M54 130c11 0 17-6 19-15M28 108h24" />{/* arrosoir */}
              <path d="M100 100c22 7 36 24 38 44-9 0-15-2-22-7-11-8-16-22-16-37zM100 100l-11-7" />{/* machette */}
              <ellipse cx="66" cy="66" rx="15" ry="10" /><path d="M66 56c-4 5-4 15 0 20M66 56c4 5 4 15 0 20" />{/* fève */}
              <path d="M140 132c8 5 12 16 12 28s-4 23-12 28c-8-5-12-16-12-28s4-23 12-28zM140 132v56" />{/* cabosse */}
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

export default function CacaoDecor({
  variant = "soft",
  className,
}: {
  variant?: "hero" | "soft" | "corner";
  className?: string;
}) {
  if (variant === "hero") {
    return (
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden text-gold-300/30", className)}>
        <CocoaPod className="absolute -left-10 top-8 h-72 w-44 rotate-[14deg]" />
        <Leaf className="absolute -right-12 -top-10 h-80 w-48 -rotate-[18deg] text-cream/15" />
        <CoffeeBean className="absolute bottom-10 right-1/3 h-20 w-28 -rotate-[10deg]" />
        <Weave className="absolute -bottom-24 -right-20 h-72 w-72 text-cream/10" />
      </div>
    );
  }
  if (variant === "corner") {
    return (
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
        <CocoaPod className="absolute -right-8 -top-10 h-56 w-32 rotate-[20deg] text-cacao-300/25" />
      </div>
    );
  }
  // soft
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden text-cacao-400/15", className)}>
      <Leaf className="absolute -left-14 top-6 h-64 w-40 rotate-[10deg]" />
      <CoffeeBean className="absolute right-8 top-1/3 h-16 w-24 rotate-[12deg] text-forest-400/20" />
      <CocoaPod className="absolute -right-12 bottom-0 h-72 w-44 -rotate-[12deg]" />
      <Weave className="absolute -left-24 -bottom-24 h-64 w-64 text-gold-400/15" />
    </div>
  );
}
