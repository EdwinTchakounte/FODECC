import { notFound } from "next/navigation";

import {
  HomePageView,
  IndexPageView,
  LibraryIndexPageView,
  LibraryItemPageView,
  NewsIndexPageView,
  NewsPageView,
  StandardPageView,
} from "@/components/page-types";
import type { WagtailPage } from "@/lib/types";

// `meta.type` Wagtail → composant de rendu.
const REGISTRY: Record<string, (props: { page: WagtailPage }) => Promise<React.ReactElement> | React.ReactElement> = {
  "home.HomePage": HomePageView,
  "standardpages.StandardPage": StandardPageView,
  "standardpages.IndexPage": IndexPageView,
  "news.NewsIndexPage": NewsIndexPageView,
  "news.NewsPage": NewsPageView,
  "library.LibraryIndexPage": LibraryIndexPageView,
  "library.LibraryItemPage": LibraryItemPageView,
};

export default function PageRenderer({ page }: { page: WagtailPage }) {
  const View = REGISTRY[page.meta?.type];
  if (!View) {
    // Type non géré (nouveau modèle de page) — à compléter dans REGISTRY.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[PageRenderer] type de page non géré : ${page.meta?.type}`);
    }
    notFound();
  }
  return <View page={page} />;
}
