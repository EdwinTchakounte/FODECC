import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Section } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { pathFromHtmlUrl, search } from "@/lib/wagtail";

export const dynamic = "force-dynamic"; // dépend de ?q=

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "common" });
  return { title: t("search") };
}

export default async function SearchPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const { q = "" } = await props.searchParams;
  const t = await getTranslations("common");
  const query = q.trim();
  const results = query ? await search(query, locale, { revalidate: false }) : [];

  return (
    <div>
      <header className="bg-gradient-to-b from-sand to-cream">
        <div className="container-x pb-12 pt-16 sm:pt-20">
          <h1 className="text-3xl font-extrabold text-cacao-950 sm:text-4xl">{t("search")}</h1>
          <form method="get" action="" className="mt-6 flex max-w-2xl gap-2">
            <input
              type="search"
              name="q"
              defaultValue={query}
              autoFocus
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="min-w-0 flex-1 rounded-full border border-cacao-200 bg-white px-5 py-3.5 text-base text-cacao-950 outline-none ring-forest-500 placeholder:text-cacao-400 focus:ring-2"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-cacao-900 px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-cacao-800"
            >
              {t("search")}
            </button>
          </form>
        </div>
      </header>

      <Section tone="cream">
        {query ? (
          results.length ? (
            <ul className="mx-auto max-w-3xl divide-y divide-cacao-100 overflow-hidden rounded-3xl bg-white shadow-card">
              {results.map((r) => (
                <li key={r.id}>
                  <Link href={pathFromHtmlUrl(r.url)} className="block px-6 py-5 transition-colors hover:bg-sand/60">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-forest-600">
                      {r.type.replace(/^.*\./, "")}
                    </p>
                    <p className="mt-1 font-semibold text-cacao-950">{r.title}</p>
                    {r.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-cacao-700">{r.excerpt}</p> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mx-auto max-w-3xl text-cacao-600">{t("notFoundText")}</p>
          )
        ) : (
          <p className="mx-auto max-w-3xl text-cacao-600">{t("searchPlaceholder")}</p>
        )}
      </Section>
    </div>
  );
}
