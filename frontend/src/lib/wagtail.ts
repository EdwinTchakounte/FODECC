/**
 * Client de l'API headless Wagtail.
 *
 * Côté serveur Next (RSC / route handlers), on lit WAGTAIL_API_URL ; côté
 * navigateur, NEXT_PUBLIC_WAGTAIL_API_URL. Les réponses sont mises en cache et
 * revalidées par tag ("wagtail") — invalidées par /api/revalidate quand Wagtail
 * publie une page (signal `page_published`).
 */
import type {
  PageListResponse,
  SearchResult,
  WagtailPage,
} from "./types";

const SERVER_API =
  process.env.WAGTAIL_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
const PUBLIC_API =
  process.env.NEXT_PUBLIC_WAGTAIL_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

function baseUrl(): string {
  return typeof window === "undefined" ? SERVER_API : PUBLIC_API;
}

interface FetchOpts {
  /** durée de revalidation ISR en secondes (défaut : 300) */
  revalidate?: number | false;
  /** mode prévisualisation : pas de cache, jeton transmis */
  preview?: { contentType: string; token: string } | null;
}

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    headers: { Accept: "application/json" },
  };

  if (opts.preview) {
    init.cache = "no-store";
  } else {
    init.next = { revalidate: opts.revalidate ?? 300, tags: ["wagtail"] };
  }

  const res = await fetch(url, init);
  if (res.status === 404) {
    throw new PageNotFoundError(url);
  }
  if (!res.ok) {
    throw new Error(`Wagtail API ${res.status} sur ${url}`);
  }
  return res.json() as Promise<T>;
}

export class PageNotFoundError extends Error {}

// ─── Pages ───────────────────────────────────────────────────────────────────

/** Récupère le détail complet d'une page par son id (tous les champs). */
export async function getPageById(
  id: number,
  opts?: FetchOpts,
): Promise<WagtailPage> {
  return apiFetch<WagtailPage>(`/api/v2/pages/${id}/?fields=*`, opts);
}

/**
 * Résout une URL (sans préfixe de locale) vers une page.
 * Wagtail renvoie une redirection 302 vers /api/v2/pages/{id}/ ; `fetch` la suit
 * et nous donne un objet minimal — on recharge ensuite tous les champs.
 *
 * @param htmlPath ex. "/le-fodecc/notre-histoire/" — "/" pour l'accueil.
 */
export async function getPageByPath(
  htmlPath: string,
  locale: string,
  opts?: FetchOpts,
): Promise<WagtailPage> {
  const normalized = htmlPath === "" || htmlPath === "/" ? "/" : `/${htmlPath.replace(/^\/|\/$/g, "")}/`;
  // Résolution par chemin (l'accueil = html_path "/" → page racine).
  // NB : la vue `find/` route l'URL depuis la racine du Site (locale par défaut) ;
  // tant que les traductions EN ne sont pas créées dans Wagtail, /en/... retombe
  // donc sur le contenu FR. Voir docs/architecture.md §2 pour la stratégie cible.
  const stub = await apiFetch<WagtailPage>(
    `/api/v2/pages/find/?html_path=${encodeURIComponent(normalized)}&locale=${encodeURIComponent(locale)}`,
    opts,
  );
  return getPageById(stub.id, opts);
}

// ─── Listes ──────────────────────────────────────────────────────────────────

export async function listPages(
  params: Record<string, string | number | undefined>,
  opts?: FetchOpts,
): Promise<PageListResponse> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  if (!qs.has("fields")) qs.set("fields", "*");
  return apiFetch<PageListResponse>(`/api/v2/pages/?${qs.toString()}`, opts);
}

/** Liste des articles d'actualité, paginée et filtrable. */
export async function listNews(
  locale: string,
  { limit = 12, offset = 0, category, search }: {
    limit?: number; offset?: number; category?: string; search?: string;
  } = {},
  opts?: FetchOpts,
): Promise<PageListResponse> {
  return listPages(
    {
      type: "news.NewsPage",
      locale,
      limit,
      offset,
      order: "-date",
      search,
      // filtre par slug de catégorie côté API : nécessite l'extension du
      // PagesAPIViewSet (filtre custom) — sinon filtrer côté front.
      ...(category ? { "category_slug": category } : {}),
    },
    opts,
  );
}

/** Liste des fiches documents (bibliothèque / transparence). */
export async function listLibraryItems(
  locale: string,
  { limit = 24, offset = 0, document_type, year, search }: {
    limit?: number; offset?: number; document_type?: string; year?: number; search?: string;
  } = {},
  opts?: FetchOpts,
): Promise<PageListResponse> {
  return listPages(
    { type: "library.LibraryItemPage", locale, limit, offset, order: "-year", document_type, year, search },
    opts,
  );
}

// ─── Recherche ───────────────────────────────────────────────────────────────

export async function search(
  query: string,
  locale: string,
  opts?: FetchOpts,
): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await apiFetch<{ results: SearchResult[] }>(
    `/api/search/?q=${encodeURIComponent(query)}&locale=${encodeURIComponent(locale)}`,
    opts,
  );
  return data.results;
}

// ─── Helpers médias ──────────────────────────────────────────────────────────

/** Convertit une URL de média relative renvoyée par Wagtail en URL absolue. */
export function mediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${PUBLIC_API}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Extrait le chemin (sans préfixe de locale) d'une URL absolue Wagtail (`meta.html_url`). */
export function pathFromHtmlUrl(htmlUrl: string | null | undefined): string {
  if (!htmlUrl) return "/";
  try {
    const u = new URL(htmlUrl);
    return u.pathname.replace(/^\/(fr|en)(?=\/|$)/, "") || "/";
  } catch {
    return htmlUrl.startsWith("/") ? htmlUrl : `/${htmlUrl}`;
  }
}
