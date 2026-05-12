import type { Metadata } from "next";

import type { WagtailPage } from "@/lib/types";
import { mediaUrl } from "@/lib/wagtail";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Construit les balises <title>, méta-description, canonical, hreflang et Open Graph. */
export function buildPageMetadata(page: WagtailPage, locale: string, path: string): Metadata {
  const title = (page.meta?.seo_title as string) || page.title;
  const description =
    (page.search_description_long as string) ||
    (page.meta?.search_description as string) ||
    (page.intro as string) ||
    "";
  const ogImage = mediaUrl(
    (page.social_image as { url?: string } | null)?.url ??
      (page.cover_image as { url?: string } | null)?.url ??
      (page.hero_image as { url?: string } | null)?.url,
  );
  const url = `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
  const otherLocale = locale === "fr" ? "en" : "fr";

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        [locale]: url,
        // NB : si les slugs diffèrent entre locales, remplacer par meta.translations
        [otherLocale]: `${SITE_URL}/${otherLocale}${path === "/" ? "" : path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "FODECC",
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      type: page.meta?.type === "news.NewsPage" ? "article" : "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: { card: ogImage ? "summary_large_image" : "summary", title, description },
  };
}
