"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const NAV: Array<{ key: string; href: string }> = [
  { key: "about", href: "/le-fodecc" },
  { key: "producers", href: "/guichet-producteurs" },
  { key: "partners", href: "/projets-partenaires" },
  { key: "transparency", href: "/transparence" },
  { key: "news", href: "/actualites" },
  { key: "contact", href: "/contact" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {/* ── Bandeau institutionnel bilingue (FR · logo · EN) — toujours visible ── */}
      <div className="relative isolate overflow-hidden text-cream">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cacao-950 via-cacao-900 to-cacao-950" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]"
        />
        <div className="container-x grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-5 sm:gap-10 sm:py-6">
          <div className="hidden text-right md:block">
            <p className="font-display text-[0.78rem] font-semibold uppercase leading-tight tracking-[0.08em] text-gold-300 sm:text-[0.95rem]">
              Fonds de Développement<br className="hidden sm:inline" /> des Filières Cacao et Café
            </p>
            <p className="mt-1.5 text-[0.7rem] italic text-cream/65 sm:text-xs">
              Au service de la promotion et du développement des filières cacao et café
            </p>
          </div>
          <Link href="/" aria-label="FODECC — accueil" className="block place-self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/fodecc-logo.jpeg"
              alt="FODECC — CCODEF"
              className="h-20 w-20 rounded-md bg-white object-contain shadow-soft ring-1 ring-cream/20 sm:h-24 sm:w-24"
            />
          </Link>
          <div className="hidden text-left md:block">
            <p className="font-display text-[0.78rem] font-semibold uppercase leading-tight tracking-[0.08em] text-gold-300 sm:text-[0.95rem]">
              Cocoa &amp; Coffee Sub-Sectors<br className="hidden sm:inline" /> Development Fund
            </p>
            <p className="mt-1.5 text-[0.7rem] italic text-cream/65 sm:text-xs">
              For the promotion and development of the cocoa and coffee sub-sectors
            </p>
          </div>
          <p className="col-span-3 mt-2 text-center text-[0.7rem] uppercase tracking-[0.16em] text-gold-300 md:hidden">
            Fonds de Développement des Filières Cacao &amp; Café
          </p>
        </div>
      </div>

      {/* ── Barre de navigation — toujours visible (statique avec le bandeau au-dessus) ── */}
      <div className="border-y border-cacao-100 bg-cream shadow-[0_8px_24px_-18px_rgba(28,20,12,0.35)]">
        <div className="container-x flex h-14 items-center gap-3 sm:h-16 sm:gap-4">
          <nav aria-label={t("common.menu")} className="hidden flex-1 items-center gap-0.5 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "group relative px-3.5 py-2 text-[0.95rem] font-medium transition-colors",
                    active ? "text-cacao-950" : "text-cacao-900/80 hover:text-cacao-950",
                  )}
                >
                  {t(`nav.${item.key}`)}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3.5 -bottom-[1px] h-0.5 origin-center bg-gold-500 transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2.5">
            <Link
              href="/recherche"
              aria-label={t("common.search")}
              className="grid h-10 w-10 place-items-center rounded-md text-cacao-900 transition-colors hover:bg-cacao-900/5"
            >
              <SearchIcon />
            </Link>
            <div className="hidden sm:block">
              <LocaleSwitcher />
            </div>
            <Link
              href="/guichet-producteurs"
              className="hidden rounded-md bg-cacao-900 px-5 py-2.5 text-sm font-semibold text-cream shadow-sm transition-all hover:bg-cacao-800 hover:shadow-md md:inline-flex"
            >
              {t("nav.cta")}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t("common.close") : t("common.menu")}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-md text-cacao-900 transition-colors hover:bg-cacao-900/5 lg:hidden"
            >
              <span className="relative block h-4 w-5" aria-hidden>
                <span className={cn("absolute left-0 top-0 h-0.5 w-5 bg-current transition-all", open && "top-1.5 rotate-45")} />
                <span className={cn("absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all", open && "opacity-0")} />
                <span className={cn("absolute left-0 top-3 h-0.5 w-5 bg-current transition-all", open && "top-1.5 -rotate-45")} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile / tablette — ouvre sous la barre de nav */}
      <div
        className={cn(
          "absolute inset-x-0 z-40 origin-top overflow-hidden bg-cream transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[100vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <nav className="container-x flex flex-col gap-1 py-6">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-lg px-4 py-3.5 text-lg font-semibold text-cacao-950 transition-colors hover:bg-cacao-900/5"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
          <div className="mt-4 flex items-center justify-between border-t border-cacao-100 pt-5">
            <LocaleSwitcher />
            <Link
              href="/guichet-producteurs"
              className="rounded-md bg-cacao-900 px-6 py-3 text-sm font-semibold text-cream"
            >
              {t("nav.cta")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
