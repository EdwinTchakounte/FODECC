import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

const SOCIALS: Array<{ label: string; href: string; path: string }> = [
  { label: "Facebook", href: "https://facebook.com", path: "M13 10h3l.5-3H13V5c0-.9.2-1.5 1.5-1.5H17V1c-.5 0-1.6-.1-2.8-.1C11.6.9 10 2.5 10 5.3V7H7v3h3v9h3z" },
  { label: "X / Twitter", href: "https://x.com", path: "M14.3 3h2.6l-5.7 6.5 6.7 8.5h-5.3l-4.1-5.2L4 18H1.4l6-6.9L1 3h5.4l3.7 4.8z" },
  { label: "LinkedIn", href: "https://linkedin.com", path: "M4.5 3.5a2 2 0 11-.01 4.01A2 2 0 014.5 3.5zM3 9h3v9H3zm6 0h2.8v1.5h.05A3.1 3.1 0 0114.7 9c3 0 3.6 2 3.6 4.6V18h-3v-3.9c0-1 0-2.3-1.4-2.3-1.4 0-1.6 1.1-1.6 2.2V18H9z" },
  { label: "YouTube", href: "https://youtube.com", path: "M19.6 6.2a2.4 2.4 0 00-1.7-1.7C16.4 4 10 4 10 4s-6.4 0-7.9.5A2.4 2.4 0 00.4 6.2C0 7.7 0 11 0 11s0 3.3.4 4.8a2.4 2.4 0 001.7 1.7C3.6 18 10 18 10 18s6.4 0 7.9-.5a2.4 2.4 0 001.7-1.7c.4-1.5.4-4.8.4-4.8s0-3.3-.4-4.8zM8 14V8l5.2 3z" },
];

export default async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto rounded-t-[2.5rem] bg-cacao-950 text-cream">
      <div className="container-x py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Marque + accroche + réseaux */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/fodecc-mark.png" alt="" className="h-10 w-10 rounded-2xl bg-cream/95 object-contain p-1" />
              <span className="text-lg font-extrabold tracking-tight">FODECC</span>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream/70">{t("footer.tagline")}</p>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20"
                >
                  <svg viewBox="0 0 20 20" className="h-[1.05rem] w-[1.05rem]" fill="currentColor" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Colonnes de liens */}
          <nav aria-label={t("footer.explore")} className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/50">{t("footer.explore")}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/le-fodecc" className="text-cream/80 hover:text-cream">{t("nav.about")}</Link></li>
              <li><Link href="/guichet-producteurs" className="text-cream/80 hover:text-cream">{t("nav.producers")}</Link></li>
              <li><Link href="/projets-partenaires" className="text-cream/80 hover:text-cream">{t("nav.partners")}</Link></li>
              <li><Link href="/actualites" className="text-cream/80 hover:text-cream">{t("nav.news")}</Link></li>
              <li><Link href="/contact" className="text-cream/80 hover:text-cream">{t("nav.contact")}</Link></li>
            </ul>
          </nav>

          <nav aria-label={t("footer.transparency")} className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/50">{t("footer.transparency")}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/transparence" className="text-cream/80 hover:text-cream">{t("nav.transparency")}</Link></li>
              <li><Link href="/le-fodecc/mot-de-l-administrateur" className="text-cream/80 hover:text-cream">{"Mot de l'Administrateur"}</Link></li>
              <li><Link href="/le-fodecc/cadre-juridique" className="text-cream/80 hover:text-cream">Cadre juridique</Link></li>
              <li><Link href="/projets-partenaires/partenaires-techniques-financiers" className="text-cream/80 hover:text-cream">Partenaires</Link></li>
              <li><Link href="/transparence" className="text-cream/80 hover:text-cream">{t("nav.library")}</Link></li>
            </ul>
          </nav>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/50">{t("footer.resources")}</p>
            <p className="mt-4 text-base font-semibold">{t("footer.newsletterTitle")}</p>
            <p className="mt-1.5 text-sm text-cream/70">{t("footer.newsletterText")}</p>
            <form className="mt-4 flex gap-2" action="#" method="post">
              <input
                type="email"
                required
                placeholder={t("footer.newsletterPlaceholder")}
                aria-label={t("footer.newsletterPlaceholder")}
                className="min-w-0 flex-1 rounded-full bg-cream/10 px-4 py-3 text-sm text-cream placeholder:text-cream/50 outline-none ring-cream/30 focus:bg-cream/15 focus:ring-2"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gold-400 px-5 py-3 text-sm font-semibold text-cacao-950 transition-colors hover:bg-gold-300"
              >
                {t("footer.newsletterButton")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/12 pt-7 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} FODECC — {t("footer.rights")}.</p>
          <nav aria-label={t("footer.siteMap")} className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/mentions-legales" className="hover:text-cream">{t("footer.legal")}</Link>
            <Link href="/confidentialite" className="hover:text-cream">{t("footer.privacy")}</Link>
            <Link href="/accessibilite" className="hover:text-cream">{t("footer.accessibility")}</Link>
            <Link href="/plan-du-site" className="hover:text-cream">{t("footer.siteMap")}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
