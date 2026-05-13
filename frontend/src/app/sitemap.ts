import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { listPages, pathFromHtmlUrl } from "@/lib/wagtail";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    try {
      const { items } = await listPages(
        { locale, fields: "meta(html_url,slug,first_published_at)", limit: 500 },
        { revalidate: 3600 },
      );
      for (const page of items) {
        const path = pathFromHtmlUrl(page.meta.html_url);
        entries.push({
          url: `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
          lastModified: page.meta.first_published_at ?? undefined,
        });
      }
    } catch {
      // backend indisponible au build : on retourne ce qu'on a
    }
  }

  if (entries.length === 0) {
    for (const locale of routing.locales) entries.push({ url: `${SITE_URL}/${locale}` });
  }
  return entries;
}
