"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/**
 * Bascule FR ⇆ EN (conserve le chemin courant, sans le préfixe de locale).
 * NB : si les slugs diffèrent entre locales (traductions Wagtail), un même
 * chemin peut tomber sur une 404 ; à terme, exploiter `meta.translations` de l'API.
 */
export default function LocaleSwitcher() {
  const t = useTranslations("common");
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className="inline-flex items-center rounded-full bg-cacao-900/8 p-0.5 text-sm font-semibold"
      role="group"
      aria-label={t("switchLanguage")}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          aria-current={loc === current ? "true" : undefined}
          onClick={() => loc !== current && router.replace(pathname, { locale: loc })}
          className={cn(
            "rounded-full px-3 py-1.5 uppercase transition-colors",
            loc === current ? "bg-cacao-900 text-cream" : "text-cacao-900/70 hover:text-cacao-950",
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
