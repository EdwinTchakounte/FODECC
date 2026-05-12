import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import PageRenderer from "@/components/PageRenderer";
import { fetchPageForRoute } from "@/lib/get-page";
import { buildPageMetadata } from "@/lib/metadata";

// ISR : régénération à la demande via /api/revalidate, sinon toutes les 5 min.
export const revalidate = 300;
// Autorise les chemins non pré-générés (génération à la 1re visite).
export const dynamicParams = true;

type Params = { locale: string; path: string[] };

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, path } = await props.params;
  try {
    const page = await fetchPageForRoute(locale, path);
    return buildPageMetadata(page, locale, "/" + path.join("/"));
  } catch {
    return {}; // le composant de page déclenchera le 404 le cas échéant
  }
}

export default async function CatchAllRoute(props: { params: Promise<Params> }) {
  const { locale, path } = await props.params;
  setRequestLocale(locale);
  const page = await fetchPageForRoute(locale, path);
  return <PageRenderer page={page} />;
}
