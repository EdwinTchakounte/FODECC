/**
 * Composants de rendu par type de page Wagtail.
 * `PageRenderer` (cf. ../PageRenderer.tsx) choisit le bon composant selon
 * `page.meta.type`.
 */
import { getFormatter, getTranslations } from "next-intl/server";

import StreamField from "@/components/StreamField";
import { Link } from "@/i18n/navigation";
import type { StreamFieldBlock, WagtailPage } from "@/lib/types";
import { listLibraryItems, listNews, listPages, mediaUrl } from "@/lib/wagtail";

function HeaderImage({ rendition, title }: { rendition: unknown; title: string }) {
  const r = rendition as { url?: string } | null;
  const src = mediaUrl(r?.url);
  return (
    <div className="bg-cacao-900 text-white">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-64 w-full object-cover opacity-70" />
      )}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold">{title}</h1>
      </div>
    </div>
  );
}

// ─── Accueil ─────────────────────────────────────────────────────────────────
export async function HomePageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const heroImg = mediaUrl((page.hero_image as { url?: string } | null)?.url);
  const showNews = page.show_latest_news !== false;
  const news = showNews ? await listNews(page.meta.locale, { limit: 3 }) : null;

  return (
    <>
      <section className="bg-cacao-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {(page.hero_title as string) || page.title}
            </h1>
            {page.hero_subtitle ? (
              <p className="mt-4 text-lg text-cacao-100">{page.hero_subtitle as string}</p>
            ) : null}
            {page.hero_cta_label && page.hero_cta_url ? (
              <a
                href={page.hero_cta_url as string}
                className="mt-6 inline-block rounded bg-white px-6 py-3 font-semibold text-cacao-900 hover:bg-cacao-50"
              >
                {page.hero_cta_label as string}
              </a>
            ) : null}
          </div>
          {heroImg && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImg} alt="" className="rounded-lg object-cover w-full h-72 md:h-96" />
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <StreamField blocks={page.body as StreamFieldBlock[]} />
      </div>

      {news && news.items.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold text-cacao-900">{t("home.latestNews")}</h2>
            <Link href="/actualites" className="text-sm text-cacao-700 underline">
              {t("home.allNews")}
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {news.items.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// ─── Page de contenu ─────────────────────────────────────────────────────────
export async function StandardPageView({ page }: { page: WagtailPage }) {
  const headerImg = mediaUrl((page.header_image as { url?: string } | null)?.url);
  return (
    <article>
      {headerImg ? (
        <HeaderImage rendition={page.header_image} title={page.title} />
      ) : (
        <div className="mx-auto max-w-4xl px-4 pt-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-cacao-900">{page.title}</h1>
        </div>
      )}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {page.intro ? <p className="text-lg text-gray-700 mb-6">{page.intro as string}</p> : null}
        <StreamField blocks={page.body as StreamFieldBlock[]} />
      </div>
    </article>
  );
}

// ─── Page de rubrique : liste ses enfants ────────────────────────────────────
export async function IndexPageView({ page }: { page: WagtailPage }) {
  const children = await listPages({
    child_of: page.id,
    locale: page.meta.locale,
    fields: "title,intro,_,meta(html_url,slug,type)",
    limit: 50,
  });
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-cacao-900">{page.title}</h1>
      {page.intro ? <p className="text-lg text-gray-700 mt-3">{page.intro as string}</p> : null}
      <ul className="mt-8 divide-y divide-cacao-100">
        {children.items.map((c) => (
          <li key={c.id} className="py-4">
            <Link href={pathFromHtmlUrl(c.meta.html_url)} className="text-lg font-semibold text-cacao-900 hover:text-cacao-700">
              {c.title}
            </Link>
            {typeof c.intro === "string" && c.intro ? (
              <p className="text-gray-600 mt-1">{c.intro}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Actualités ──────────────────────────────────────────────────────────────
export async function NewsIndexPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const list = await listNews(page.meta.locale, { limit: 24 });
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-cacao-900">{page.title || t("news.indexTitle")}</h1>
      {page.intro ? <p className="text-lg text-gray-700 mt-3">{page.intro as string}</p> : null}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {list.items.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>
      {list.items.length === 0 && <p className="mt-8 text-gray-500">{t("news.noResults")}</p>}
    </div>
  );
}

export async function NewsPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const fmt = await getFormatter();
  const cover = mediaUrl((page.cover_image as { url?: string } | null)?.url);
  const date = page.date ? new Date(page.date as string) : null;
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/actualites" className="text-sm text-cacao-700 underline">
        ← {t("common.backToList")}
      </Link>
      <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-cacao-900">{page.title}</h1>
      {date && (
        <p className="mt-2 text-sm text-gray-500">
          {t("common.publishedOn")} {fmt.dateTime(date, { dateStyle: "long" })}
        </p>
      )}
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="mt-6 rounded-lg w-full object-cover" />
      )}
      {page.intro ? <p className="mt-6 text-lg text-gray-700">{page.intro as string}</p> : null}
      <div className="mt-6">
        <StreamField blocks={page.body as StreamFieldBlock[]} />
      </div>
    </article>
  );
}

// ─── Bibliothèque / transparence ─────────────────────────────────────────────
export async function LibraryIndexPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const list = await listLibraryItems(page.meta.locale, { limit: 50 });
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold text-cacao-900">{page.title || t("library.indexTitle")}</h1>
      {page.intro ? <p className="text-lg text-gray-700 mt-3">{page.intro as string}</p> : null}
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {list.items.map((doc) => (
          <li key={doc.id} className="rounded border border-cacao-100 p-4 flex items-start gap-3">
            <span aria-hidden className="text-2xl">📄</span>
            <div>
              <a
                href={(doc.file_url as string) || pathFromHtmlUrl(doc.meta.html_url)}
                className="font-semibold text-cacao-900 hover:text-cacao-700"
              >
                {doc.title}
              </a>
              {typeof doc.description === "string" && doc.description ? (
                <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
              ) : null}
              <p className="text-xs text-gray-400 mt-1">
                {[doc.document_type, doc.year].filter(Boolean).join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {list.items.length === 0 && <p className="mt-8 text-gray-500">{t("library.noResults")}</p>}
    </div>
  );
}

export async function LibraryItemPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const fileUrl = (page.file_url as string) || (page.external_url as string);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/transparence" className="text-sm text-cacao-700 underline">
        ← {t("common.backToList")}
      </Link>
      <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-cacao-900">{page.title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {[page.document_type, page.year].filter(Boolean).join(" · ")}
      </p>
      {page.description ? <p className="mt-6 text-gray-700">{page.description as string}</p> : null}
      {fileUrl && (
        <a
          href={fileUrl}
          className="mt-8 inline-block rounded bg-cacao-700 px-6 py-3 font-semibold text-white hover:bg-cacao-900"
        >
          {t("common.download")}
        </a>
      )}
    </article>
  );
}

// ─── Bricoles ────────────────────────────────────────────────────────────────
function NewsCard({ article }: { article: WagtailPage }) {
  const thumb = mediaUrl(
    (article.cover_image_thumb as { url?: string } | null)?.url ??
      (article.cover_image as { url?: string } | null)?.url,
  );
  return (
    <Link href={pathFromHtmlUrl(article.meta.html_url)} className="group block rounded-lg overflow-hidden border border-cacao-100">
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumb} alt="" className="h-44 w-full object-cover" />
      )}
      <div className="p-4">
        {article.date ? <p className="text-xs text-gray-400">{String(article.date)}</p> : null}
        <p className="mt-1 font-semibold text-cacao-900 group-hover:text-cacao-700 line-clamp-3">{article.title}</p>
      </div>
    </Link>
  );
}

/** L'API renvoie une URL absolue (html_url) ; on en extrait le chemin (sans préfixe de locale). */
export function pathFromHtmlUrl(htmlUrl: string | null | undefined): string {
  if (!htmlUrl) return "/";
  try {
    const u = new URL(htmlUrl);
    // retire un éventuel préfixe /fr ou /en
    return u.pathname.replace(/^\/(fr|en)(?=\/|$)/, "") || "/";
  } catch {
    return htmlUrl.startsWith("/") ? htmlUrl : `/${htmlUrl}`;
  }
}
