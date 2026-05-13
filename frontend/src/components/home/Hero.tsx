"use client";

import { useState } from "react";

import VideoModal from "@/components/home/VideoModal";
import CacaoDecor from "@/components/ui/CacaoDecor";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

// Photo de repli (servie localement depuis public/img/, issue du site fodecc.cm)
// si la HomePage n'a pas d'image hero définie dans le CMS.
const DEFAULT_BG = "/img/hero.jpg";

type HeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  cta?: { label: string; href: string } | null;
  cta2?: { label: string; href: string } | null;
  videoLabel: string;
  scrollLabel: string;
};

const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

function CtaLink({ data, primary }: { data: { label: string; href: string }; primary?: boolean }) {
  const cls = primary
    ? "bg-cream text-cacao-950 hover:bg-white shadow-card hover:shadow-card-hover"
    : "border border-cream/40 text-cream backdrop-blur-sm hover:bg-cream/10";
  const inner = (
    <>
      {data.label}
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
  const common = cn("inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-all active:scale-[0.98]", cls);
  return isInternal(data.href) ? (
    <Link href={data.href} className={common}>{inner}</Link>
  ) : (
    <a href={data.href} className={common}>{inner}</a>
  );
}

export default function Hero({
  eyebrow,
  title,
  subtitle,
  imageUrl,
  videoUrl,
  cta,
  cta2,
  videoLabel,
  scrollLabel,
}: HeroProps) {
  const [bgOk, setBgOk] = useState(true);
  const bg = imageUrl || DEFAULT_BG;

  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-cacao-900 via-cacao-950 to-forest-900 text-cream">
      {/* Image de fond (avec repli sur le dégradé si elle échoue) */}
      {bgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bg}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full scale-105 object-cover opacity-90 animate-fade-in"
          onError={() => setBgOk(false)}
        />
      ) : null}
      {/* Voiles de lisibilité */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-cacao-950 via-cacao-950/70 to-cacao-950/40" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(125%_80%_at_12%_88%,rgba(33,18,8,0.55),transparent)]" />
      <CacaoDecor variant="hero" />

      <div className="container-x flex min-h-[78vh] flex-col items-center justify-center pb-20 pt-24 text-center sm:min-h-[82vh] sm:pt-28">
        <div className="mx-auto max-w-4xl">
          {eyebrow ? (
            <span className="eyebrow mx-auto animate-fade-up justify-center text-gold-300">
              <span className="h-px w-8 bg-current opacity-70" aria-hidden />
              {eyebrow}
              <span className="h-px w-8 bg-current opacity-70" aria-hidden />
            </span>
          ) : null}
          <h1
            className="mt-5 font-display text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.08] tracking-tight text-balance text-cream animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-cream/85 animate-fade-up sm:text-xl" style={{ animationDelay: "140ms" }}>
              {subtitle}
            </p>
          ) : null}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: "220ms" }}>
            {cta ? <CtaLink data={cta} primary /> : null}
            {videoUrl ? <VideoModal src={videoUrl} label={videoLabel} poster={imageUrl || DEFAULT_BG} /> : cta2 ? <CtaLink data={cta2} /> : null}
            {videoUrl && cta2 ? <CtaLink data={cta2} /> : null}
          </div>
        </div>
      </div>

      {/* Indicateur de scroll, centré en bas */}
      <a
        href="#apres-hero"
        aria-label={scrollLabel}
        className="absolute inset-x-0 bottom-6 mx-auto hidden w-fit text-cream/60 transition-colors hover:text-cream sm:block"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full border border-cream/30">
          <svg viewBox="0 0 16 16" className="h-4 w-4 animate-bob" fill="none" aria-hidden>
            <path d="M8 3v9M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </a>
    </section>
  );
}
