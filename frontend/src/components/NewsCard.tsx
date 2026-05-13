import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { WagtailPage } from "@/lib/types";
import { mediaUrl, pathFromHtmlUrl } from "@/lib/wagtail";

function formatDate(value: unknown, locale: string): string {
  if (typeof value !== "string") return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsCard({
  article,
  locale,
  featured = false,
}: {
  article: WagtailPage;
  locale: string;
  featured?: boolean;
}) {
  const href = pathFromHtmlUrl(article.meta?.html_url);
  const img = mediaUrl(
    (article.cover_thumb_url as string) || (article.cover_url as string) || undefined,
  );
  const category =
    (article.category_list as Array<{ name: string }> | undefined)?.[0]?.name ?? null;
  const date = formatDate(article.date, locale);

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        featured && "sm:flex-row",
      )}
    >
      <div className={cn("relative overflow-hidden bg-sand", featured ? "sm:w-1/2" : "")}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
              featured ? "aspect-[4/3] sm:aspect-auto sm:min-h-[18rem]" : "aspect-[16/10]",
            )}
          />
        ) : (
          <div className={cn("flex items-center justify-center text-cacao-300", featured ? "aspect-[4/3]" : "aspect-[16/10]")}>
            <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" aria-hidden>
              <path d="M4 5h16v14H4z M4 15l4-4 3 3 4-5 5 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}
        {category ? (
          <span className="absolute left-4 top-4 rounded-full bg-cacao-950/70 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-cream backdrop-blur-sm">
            {category}
          </span>
        ) : null}
      </div>
      <div className={cn("flex flex-1 flex-col p-6", featured && "sm:p-8")}>
        {date ? <p className="text-xs font-medium uppercase tracking-wide text-cacao-500">{date}</p> : null}
        <h3
          className={cn(
            "mt-2 font-bold leading-snug text-cacao-950 transition-colors group-hover:text-forest-700",
            featured ? "text-2xl" : "text-lg line-clamp-3",
          )}
        >
          {article.title}
        </h3>
        {featured && typeof article.intro === "string" && article.intro ? (
          <p className="mt-3 line-clamp-3 text-cacao-900/75">{article.intro}</p>
        ) : null}
        <span className="mt-auto pt-4 text-sm font-semibold text-forest-700">
          <span className="inline-flex items-center gap-1.5">
            {locale === "en" ? "Read" : "Lire l'article"}
            <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" aria-hidden>
              <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </div>
    </Link>
  );
}
