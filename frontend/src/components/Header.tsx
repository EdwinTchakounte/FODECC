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

function Logo({ light }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="FODECC — accueil">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/fodecc-mark.png"
        alt=""
        className="h-10 w-10 rounded-2xl object-contain"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
      <span className={cn("text-lg font-extrabold tracking-tight", light ? "text-cream" : "text-cacao-950")}>
        FODECC
      </span>
    </Link>
  );
}

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
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu mobile au changement de route
  useEffect(() => setOpen(false), [pathname]);

  // Bloque le scroll quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-cacao-100 bg-cream/85 backdrop-blur-md"
          : "border-b border-transparent bg-cream",
      )}
    >
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-4">
        <Logo />

        <nav aria-label={t("common.menu")} className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors",
                  active ? "bg-cacao-900/8 text-cacao-950" : "text-cacao-900/80 hover:bg-cacao-900/5 hover:text-cacao-950",
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/recherche"
            aria-label={t("common.search")}
            className="grid h-10 w-10 place-items-center rounded-full text-cacao-900 transition-colors hover:bg-cacao-900/5"
          >
            <SearchIcon />
          </Link>
          <div className="hidden sm:block">
            <LocaleSwitcher />
          </div>
          <Link
            href="/guichet-producteurs"
            className="hidden rounded-full bg-cacao-900 px-5 py-2.5 text-sm font-semibold text-cream shadow-card transition-all hover:bg-cacao-800 hover:shadow-card-hover md:inline-flex"
          >
            {t("nav.cta")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("common.close") : t("common.menu")}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full text-cacao-900 transition-colors hover:bg-cacao-900/5 lg:hidden"
          >
            <span className="relative block h-4 w-5" aria-hidden>
              <span className={cn("absolute left-0 top-0 h-0.5 w-5 bg-current transition-all", open && "top-1.5 rotate-45")} />
              <span className={cn("absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all", open && "opacity-0")} />
              <span className={cn("absolute left-0 top-3 h-0.5 w-5 bg-current transition-all", open && "top-1.5 -rotate-45")} />
            </span>
          </button>
        </div>
      </div>

      {/* Menu mobile / tablette */}
      <div
        className={cn(
          "fixed inset-x-0 top-[4.5rem] z-40 origin-top overflow-hidden bg-cream transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[calc(100vh-4.5rem)] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <nav className="container-x flex flex-col gap-1 py-6">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="rounded-2xl px-4 py-3.5 text-lg font-semibold text-cacao-950 transition-colors hover:bg-cacao-900/5"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
          <div className="mt-4 flex items-center justify-between border-t border-cacao-100 pt-5">
            <LocaleSwitcher />
            <Link
              href="/guichet-producteurs"
              className="rounded-full bg-cacao-900 px-6 py-3 text-sm font-semibold text-cream"
            >
              {t("nav.cta")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
