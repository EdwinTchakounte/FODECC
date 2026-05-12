import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { PageNotFoundError, getPageByPath } from "@/lib/wagtail";
import type { WagtailPage } from "@/lib/types";

/**
 * Récupère la page Wagtail correspondant à `pathSegments` (ex. ["le-fodecc","notre-histoire"]).
 * Renvoie un 404 Next si introuvable. Gère le mode brouillon (Draft Mode).
 */
export async function fetchPageForRoute(
  locale: string,
  pathSegments: string[] = [],
): Promise<WagtailPage> {
  const { isEnabled: preview } = await draftMode();
  const htmlPath = pathSegments.length ? pathSegments.join("/") : "/";
  try {
    return await getPageByPath(htmlPath, locale, {
      // en preview : pas de cache ; sinon ISR 5 min
      revalidate: preview ? false : 300,
      ...(preview ? { preview: { contentType: "", token: "" } } : {}),
    });
  } catch (err) {
    if (err instanceof PageNotFoundError) notFound();
    throw err;
  }
}
