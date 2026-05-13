"use client";

import { useState } from "react";

import VideoModal from "@/components/home/VideoModal";
import { Blobs } from "@/components/ui/Decor";
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
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-cacao-950 via-cacao-950/65 to-cacao-950/35" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_15%_85%,rgba(33,18,8,0.5),transparent)]" />
      <Blobs variant="dark" />

      <div className="container-x flex min-h-[88vh] flex-col justify-end pb-16 pt-32 sm:min-h-[94vh] sm:pb-24">
        <div className="max-w-3xl">
          {eyebrow ? (
            <span className="eyebrow animate-fade-up text-gold-300">
              <span className="h-px w-8 bg-current opacity-70" aria-hidden />
              {eyebrow}
            </span>
          ) : null}
          <h1
            className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-cream animate-fade-up sm:text-[3.75rem] lg:text-[4.5rem]"
            style={{ animationDelay: "60ms" }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/85 animate-fade-up sm:text-xl" style={{ animationDelay: "140ms" }}>
              {subtitle}
            </p>
          ) : null}
          <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: "220ms" }}>
            {cta ? <CtaLink data={cta} primary /> : null}
            {videoUrl ? <VideoModal src={videoUrl} label={videoLabel} poster={imageUrl || DEFAULT_BG} /> : cta2 ? <CtaLink data={cta2} /> : null}
            {videoUrl && cta2 ? <CtaLink data={cta2} /> : null}
          </div>
        </div>

        <a
          href="#apres-hero"
          className="mt-14 hidden items-center gap-3 self-start text-sm font-medium text-cream/70 transition-colors hover:text-cream sm:inline-flex"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-cream/30">
            <svg viewBox="0 0 16 16" className="h-4 w-4 animate-bob" fill="none" aria-hidden>
              <path d="M8 3v9M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {scrollLabel}
        </a>
      </div>
    </section>
  );
}
