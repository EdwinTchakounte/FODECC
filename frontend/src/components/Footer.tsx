import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export default async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-cacao-100 bg-cacao-50">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <p className="font-extrabold text-cacao-900">FODECC</p>
          <p className="text-gray-600 mt-2">
            Fonds de Développement des Filières Cacao et Café — Yaoundé, Cameroun.
          </p>
        </div>
        <nav aria-label={t("footer.siteMap")} className="space-y-1">
          <Link href="/le-fodecc" className="block hover:text-cacao-700">{t("nav.about")}</Link>
          <Link href="/transparence" className="block hover:text-cacao-700">{t("nav.transparency")}</Link>
          <Link href="/actualites" className="block hover:text-cacao-700">{t("nav.news")}</Link>
          <Link href="/contact" className="block hover:text-cacao-700">{t("nav.contact")}</Link>
        </nav>
        <div className="space-y-1">
          <Link href="/mentions-legales" className="block hover:text-cacao-700">{t("footer.legal")}</Link>
          <Link href="/accessibilite" className="block hover:text-cacao-700">{t("footer.accessibility")}</Link>
          <Link href="/plan-du-site" className="block hover:text-cacao-700">{t("footer.siteMap")}</Link>
        </div>
      </div>
      <div className="border-t border-cacao-100 py-4 text-center text-xs text-gray-500">
        © {year} FODECC — {t("footer.rights")}.
      </div>
    </footer>
  );
}
