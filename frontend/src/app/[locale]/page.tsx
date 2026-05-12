import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import PageRenderer from "@/components/PageRenderer";
import { fetchPageForRoute } from "@/lib/get-page";
import { buildPageMetadata } from "@/lib/metadata";

export const revalidate = 300;

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  try {
    const page = await fetchPageForRoute(locale, []);
    return buildPageMetadata(page, locale, "/");
  } catch {
    return {}; // le composant de page déclenchera le 404 le cas échéant
  }
}

export default async function HomeRoute(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const page = await fetchPageForRoute(locale, []);
  return <PageRenderer page={page} />;
}
