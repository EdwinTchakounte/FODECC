"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Bascule FR ⇆ EN. Conserve le chemin courant (sans le préfixe de locale).
 * NB : si les slugs diffèrent entre locales (traductions Wagtail), le
 * basculement « même chemin » peut tomber sur une 404 ; à terme, utiliser
 * `meta.translations` renvoyé par l'API pour pointer vers la bonne URL.
 */
export default function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const other = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: other })}
      className="text-sm font-medium underline underline-offset-2 hover:text-cacao-700"
      aria-label={t("switchLanguage")}
    >
      {other.toUpperCase()}
    </button>
  );
}
