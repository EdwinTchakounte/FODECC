import type { ReactNode } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-cacao-900 text-cream hover:bg-cacao-800 shadow-card hover:shadow-card-hover",
  secondary:
    "bg-gold-400 text-cacao-950 hover:bg-gold-300 shadow-card hover:shadow-card-hover",
  ghost:
    "bg-transparent text-cacao-900 hover:bg-cacao-900/5",
  light:
    "bg-cream text-cacao-950 hover:bg-white shadow-card",
  "outline-light":
    "border border-cream/40 text-cream hover:bg-cream/10 backdrop-blur-sm",
};

const SIZES: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-7 py-3.5 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 " +
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-forest-500 will-change-transform " +
  "active:scale-[0.98]";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** lien interne (avec préfixe de locale) vs lien externe / brut */
  external?: boolean;
};

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  external,
}: Props) {
  const cls = cn(base, VARIANTS[variant], SIZES[size], className);
  const content = (
    <>
      {children}
      <ArrowIcon />
    </>
  );
  if (!href) return <button className={cls}>{content}</button>;
  if (external || /^https?:|^mailto:|^tel:/.test(href)) {
    return (
      <a href={href} className={cls} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
