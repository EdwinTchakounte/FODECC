// Types (volontairement souples) des réponses de l'API headless Wagtail v2.
// À resserrer une fois le modèle de contenu figé.

export interface WagtailImageRendition {
  url: string;
  full_url?: string;
  width: number;
  height: number;
  alt: string;
}

export interface WagtailMeta {
  type: string; // ex. "standardpages.StandardPage"
  detail_url: string;
  html_url: string | null;
  slug: string;
  show_in_menus: boolean;
  seo_title: string;
  search_description: string;
  first_published_at: string | null;
  locale: string;
  alias_of?: unknown;
}

export interface StreamFieldBlock<T = unknown> {
  type: string;
  value: T;
  id: string;
}

export interface WagtailPage {
  id: number;
  meta: WagtailMeta;
  title: string;
  // champs custom — dépendent du type de page (cf. backend api_fields)
  [key: string]: unknown;
}

export interface PageListResponse {
  meta: { total_count: number };
  items: WagtailPage[];
}

export interface SearchResult {
  id: number;
  title: string;
  url: string;
  type: string;
  excerpt: string;
}
