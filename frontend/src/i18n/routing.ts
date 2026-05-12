import { defineRouting } from "next-intl/routing";

// Bilingue FR / EN. Le français est la langue par défaut ; les URLs sont
// toujours préfixées par la locale (/fr/..., /en/...) — cohérent avec les
// `html_path` renvoyés par l'API Wagtail (qui inclut le préfixe de locale).
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
