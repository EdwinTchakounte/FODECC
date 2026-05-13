/**
 * Rendu par type de page Wagtail. `PageRenderer` choisit le composant selon
 * `page.meta.type`. Style éditorial inspiré des sites institutionnels de
 * référence (UNESCO, IFAD, PAM/WFP) : grandes images douces, typo serif/sans,
 * formes organiques en arrière-plan, animations sobres, pleine largeur d'écran.
 */
import { getFormatter, getTranslations } from "next-intl/server";

import NewsCard from "@/components/NewsCard";
import StreamField from "@/components/StreamField";
import Hero from "@/components/home/Hero";
import LogoMarquee from "@/components/home/LogoMarquee";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CacaoDecor, { ToolsPattern } from "@/components/ui/CacaoDecor";
import Counter from "@/components/ui/Counter";
import { Blobs, DotGrid } from "@/components/ui/Decor";
import Photo from "@/components/ui/Photo";
import Reveal from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { StreamFieldBlock, WagtailPage } from "@/lib/types";
import { listLibraryItems, listNews, listPages, mediaUrl, pathFromHtmlUrl } from "@/lib/wagtail";

// Visuels de repli, servis localement depuis public/img/ (images issues de fodecc.cm)
// — remplaçables par des images uploadées dans le CMS.
const PHOTO_ABOUT = "/img/about.jpg";
const PHOTO_ADMIN = "/img/admin.jpg";
const PHOTO_FIGURES = "/img/feature.jpg";

/** L'API renvoie des URLs d'images relatives (`/media/...`) ; on les rend absolues. */
function img(v: unknown): string | undefined {
  return mediaUrl(typeof v === "string" && v ? v : undefined);
}

// ─── En-tête de page (intérieures) ───────────────────────────────────────────
function PageHero({ eyebrow, title, intro, imageUrl }: { eyebrow?: string; title: string; intro?: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <header className="relative isolate overflow-hidden bg-cacao-950 text-cream">
        <Photo src={imageUrl} className="absolute inset-0 -z-10 scale-105 opacity-90" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-cacao-950 via-cacao-950/65 to-cacao-950/35" />
        <div className="container-x flex min-h-[42vh] flex-col justify-end pb-12 pt-32 sm:min-h-[52vh]">
          <div className="max-w-3xl animate-fade-up">
            {eyebrow ? <span className="eyebrow text-gold-300"><span className="h-px w-7 bg-current opacity-70" aria-hidden />{eyebrow}</span> : null}
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-cream sm:text-5xl">{title}</h1>
            {intro ? <p className="mt-5 max-w-2xl text-lg text-cream/85">{intro}</p> : null}
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="relative isolate overflow-hidden bg-sand">
      <Blobs variant="warm" />
      <div className="container-x pb-12 pt-16 sm:pt-24">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow ? <span className="eyebrow"><span className="h-px w-7 bg-current opacity-60" aria-hidden />{eyebrow}</span> : null}
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-cacao-950 sm:text-5xl">{title}</h1>
          {intro ? <p className="mt-5 max-w-2xl text-lg text-cacao-900/80">{intro}</p> : null}
        </div>
      </div>
    </header>
  );
}

function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-800">
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden>
        <path d="M16 10H5M10 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  );
}

const ArrowSm = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" aria-hidden>
    <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Accueil ─────────────────────────────────────────────────────────────────
const AUDIENCES = [
  { key: "producer", href: "/guichet-producteurs", icon: "M4 18v-1a6 6 0 0112 0v1 M10 3a3.5 3.5 0 100 7 3.5 3.5 0 000-7", tone: "bg-forest-700 text-cream", bar: "bg-forest-600" },
  { key: "partner", href: "/transparence", icon: "M5 17h10M5 17V8l5-4 5 4v9 M8 17v-5h4v5", tone: "bg-cacao-900 text-cream", bar: "bg-cacao-700" },
  { key: "press", href: "/actualites", icon: "M4 5h12v10H4z M4 9h12 M7 12h6", tone: "bg-gold-400 text-cacao-950", bar: "bg-gold-400" },
] as const;

// Trois leviers d'action (section « À propos »).
const PILLARS = [
  { key: "pillar1", icon: "M10 2v3M10 15v3M2 10h3M15 10h3M5 5l2 2M13 13l2 2M15 5l-2 2M7 13l-2 2 M10 7a3 3 0 100 6 3 3 0 000-6", tone: "bg-forest-700" },
  { key: "pillar2", icon: "M4 18v-1a6 6 0 0112 0v1 M10 3a3.5 3.5 0 100 7 3.5 3.5 0 000-7", tone: "bg-cacao-800" },
  { key: "pillar3", icon: "M3 17l4-5 3 3 4-6 3 4 M3 4v13h14", tone: "bg-gold-500" },
] as const;

// Logos d'opérateurs / partenaires (servis depuis public/logos/, issus de fodecc.cm).
const PARTNER_LOGOS: Array<{ name: string; src: string }> = [
  { name: "IRAD", src: "/logos/irad.png" },
  { name: "SODECAO", src: "/logos/sodecao.jpg" },
  { name: "GEX", src: "/logos/gex.png" },
  { name: "CAPEF", src: "/logos/capef.png" },
  { name: "MINADER", src: "/logos/minader.png" },
  { name: "ICCO", src: "/logos/icco.jpg" },
  { name: "World Cocoa Foundation", src: "/logos/wcf.png" },
  { name: "SGS", src: "/logos/sgs.png" },
  { name: "FAPAM", src: "/logos/fapam.png" },
];
// Partenaires institutionnels & financiers (texte — logos non disponibles ou non libres).
const PARTNER_NAMES = ["FIDA", "CAFI", "Union Européenne", "Banque Mondiale", "Fonds Vert Climat", "KPMG", "ONCC", "SUACC", "MINCOMMERCE", "MINRESI", "MINFI"];

const FIGURES = [
  { value: "13 000+", label: "producteurs accompagnés" },
  { value: "10", label: "régions du Cameroun couvertes" },
  { value: "8", label: "guichets producteurs déployés" },
  { value: "2020", label: "lancement du Guichet Producteurs" },
];

export async function HomePageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const locale = page.meta.locale;
  const heroImg = img(page.hero_image_url);
  const adminPhoto = img(page.admin_photo_url) || PHOTO_ADMIN;
  const adminQuote = (page.admin_quote as string) || t("home.adminQuoteFallback");
  const adminName = (page.admin_name as string) || "Samuel Donatien NENGUE";
  const adminRole = (page.admin_role as string) || "Administrateur / Directeur Général";
  const adminUrl = (page.admin_page_url as string) || "/le-fodecc/mot-de-l-administrateur";

  const news = page.show_latest_news !== false ? (await listNews(locale, { limit: 6 })).items : [];
  const docs = (await listLibraryItems(locale, { limit: 6 })).items;

  return (
    <>
      <Hero
        eyebrow={(page.hero_eyebrow as string) || undefined}
        title={(page.hero_title as string) || page.title}
        subtitle={(page.hero_subtitle as string) || undefined}
        imageUrl={heroImg || null}
        videoUrl={(page.hero_video_url as string) || null}
        cta={page.hero_cta_label && page.hero_cta_url ? { label: page.hero_cta_label as string, href: page.hero_cta_url as string } : null}
        cta2={page.hero_cta2_label && page.hero_cta2_url ? { label: page.hero_cta2_label as string, href: page.hero_cta2_url as string } : null}
        videoLabel={t("home.watchVideo")}
        scrollLabel={t("home.scroll")}
      />

      {/* ── À propos / mission + 3 leviers ──────────────────────────────── */}
      <Section id="apres-hero" tone="cream" className="relative isolate overflow-hidden">
        <ToolsPattern className="text-cacao-900" opacity={0.05} />
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading eyebrow={t("home.aboutEyebrow")} title={t("home.aboutTitle")} />
            <p className="mt-5 text-lg leading-relaxed text-cacao-900/80">{t("home.aboutText")}</p>
            <div className="mt-8">
              <Button href="/le-fodecc" variant="primary">{t("home.aboutCta")}</Button>
            </div>
          </Reveal>
          <Reveal delay={120} className="relative">
            <div className="absolute -right-5 -top-5 h-28 w-28 border-2 border-gold-400/50" aria-hidden />
            <div className="absolute -bottom-5 -left-5 h-28 w-28 border-2 border-forest-400/40" aria-hidden />
            <div className="relative aspect-[5/4] overflow-hidden rounded-lg shadow-soft">
              <Photo src={PHOTO_ABOUT} />
              <div className="absolute inset-0 bg-gradient-to-t from-cacao-950/25 to-transparent" />
            </div>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-6 border-t border-cacao-200/70 pt-12 sm:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.key} delay={i * 90}>
              <div className="flex h-full gap-4">
                <span className={cn("mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-md text-cream", p.tone)} aria-hidden>
                  <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none"><path d={p.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-cacao-950">{t(`home.${p.key}Title`)}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-relaxed text-cacao-900/75">{t(`home.${p.key}Text`)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Mot de l'Administrateur ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-cacao-950 text-cream">
        <ToolsPattern className="text-cream" opacity={0.05} />
        <div className="container-x py-20 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <Reveal className="order-2 lg:order-1">
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -left-4 -top-4 h-24 w-24 border-2 border-gold-400/50" aria-hidden />
                <div className="absolute -bottom-4 -right-4 h-24 w-24 border-2 border-forest-400/40" aria-hidden />
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg shadow-soft">
                  <Photo src={adminPhoto} />
                </div>
              </div>
            </Reveal>
            <Reveal delay={120} className="order-1 lg:order-2">
              <span className="eyebrow text-gold-300"><span className="h-px w-7 bg-current opacity-70" aria-hidden />{t("home.adminEyebrow")}</span>
              <blockquote className="mt-5 font-display text-2xl font-medium leading-snug text-balance text-cream sm:text-3xl">
                <span className="text-gold-300/70">«&nbsp;</span>{adminQuote}<span className="text-gold-300/70">&nbsp;»</span>
              </blockquote>
              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="text-base font-semibold text-cream">{adminName}</p>
                <p className="text-sm text-cream/65">{adminRole}</p>
              </div>
              <div className="mt-7">
                <Link href={pathFromHtmlUrl(adminUrl)} className="group inline-flex items-center gap-2 rounded-md border border-cream/35 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10">
                  {t("home.adminReadMore")}<ArrowSm />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Parcours par audience ───────────────────────────────────────── */}
      <Section tone="sand">
        <Reveal><SectionHeading eyebrow={t("home.audiencesEyebrow")} title={t("home.audiencesTitle")} /></Reveal>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-cacao-200 bg-cacao-200 md:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <Reveal key={a.key} delay={i * 90}>
              <Link href={a.href} className="group relative flex h-full flex-col bg-white p-8 transition-colors hover:bg-cream sm:p-9">
                <span className={cn("absolute left-0 top-0 h-1 w-full", a.bar)} aria-hidden />
                <span className="font-display text-5xl font-semibold text-cacao-100">{String(i + 1).padStart(2, "0")}</span>
                <span className={cn("mt-4 grid h-12 w-12 place-items-center rounded-md text-cream", a.tone)} aria-hidden>
                  <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none"><path d={a.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-cacao-950">{t(`home.${a.key}Card`)}</h3>
                <p className="mt-2.5 text-cacao-900/75">{t(`home.${a.key}CardText`)}</p>
                <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">{t(`home.${a.key}CardCta`)}<ArrowSm /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── FODECC en chiffres (sur photo, stats reliées) ───────────────── */}
      <section className="relative isolate overflow-hidden bg-forest-900 text-cream">
        <Photo src={PHOTO_FIGURES} className="absolute inset-0 -z-10 object-cover opacity-25" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-forest-900 via-forest-900/85 to-cacao-950/80" />
        <DotGrid className="text-cream" />
        <div className="container-x py-20 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionHeading invert align="center" eyebrow={t("home.figuresEyebrow")} title={t("home.figuresTitle")} />
          </Reveal>
          <Reveal delay={120}>
            <div className="relative mx-auto mt-14 grid max-w-5xl gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {/* ligne qui relie les statistiques (desktop) */}
              <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-2 hidden h-0.5 bg-gradient-to-r from-transparent via-gold-300/40 to-transparent lg:block" aria-hidden />
              {FIGURES.map((f) => (
                <div key={f.label} className="relative flex flex-col items-center text-center">
                  <span className="relative z-10 mb-5 grid h-4 w-4 place-items-center rounded-full bg-gold-300 ring-4 ring-forest-900" aria-hidden />
                  <dt className="font-display text-[clamp(2.4rem,4vw,3.25rem)] font-semibold leading-none text-gold-300">
                    <Counter value={f.value} />
                  </dt>
                  <dd className="mt-3 max-w-[16ch] text-sm leading-snug text-cream/80">{f.label}</dd>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── À la une (mise en page magazine) ────────────────────────────── */}
      {news.length > 0 ? (
        <Section tone="cream">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow={t("home.newsEyebrow")} title={t("home.newsTitle")} />
              <Button href="/actualites" variant="ghost" size="sm" className="shrink-0">{t("home.allNews")}</Button>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-5">
            {news[0] ? <Reveal className="lg:col-span-3"><NewsCard article={news[0]} locale={locale} featured /></Reveal> : null}
            {news[1] ? <Reveal delay={90} className="lg:col-span-2"><NewsCard article={news[1]} locale={locale} /></Reveal> : null}
          </div>
          {news.length > 2 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(2, 5).map((a, i) => <Reveal key={a.id} delay={i * 80}><NewsCard article={a} locale={locale} /></Reveal>)}
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* ── Rapports & documents (publications en couvertures) ─────────── */}
      {docs.length > 0 ? (
        <Section tone="sand" className="relative isolate overflow-hidden">
          <ToolsPattern className="text-cacao-900" opacity={0.04} />
          <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_auto]">
            <Reveal>
              <SectionHeading eyebrow={t("home.docsEyebrow")} title={t("home.docsTitle")} />
              <p className="mt-5 max-w-2xl text-cacao-900/80">{t("home.ctaText")}</p>
            </Reveal>
            <Reveal delay={80}>
              <Button href="/transparence" variant="primary">{t("home.docsCta")}</Button>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {docs.slice(0, 4).map((d, i) => (
              <Reveal key={d.id} delay={(i % 4) * 70}>
                <DocCard doc={d} openLabel={t("library.open")} downloadLabel={t("common.download")} />
              </Reveal>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ── Écosystème : logos en bandeau horizontal ────────────────────── */}
      <Section tone="cream" spacing="md" className="relative isolate overflow-hidden">
        <CacaoDecor variant="corner" />
        <Reveal><SectionHeading eyebrow={t("home.partnersEyebrow")} title={t("home.partnersTitle")} align="center" /></Reveal>
        <Reveal delay={120}>
          <div className="mt-10"><LogoMarquee items={PARTNER_LOGOS} /></div>
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-cacao-700">
            {"Avec l'appui de : "}
            <span className="font-semibold text-cacao-900">{PARTNER_NAMES.join(" · ")}</span>
          </p>
        </Reveal>
      </Section>

      {/* ── CTA final ───────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-forest-700 text-cream">
        <ToolsPattern className="text-cream" opacity={0.06} />
        <div className="container-x py-16 sm:py-20">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-8 rounded-lg bg-forest-800/55 p-9 backdrop-blur-sm sm:p-12 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-semibold text-balance text-cream">{t("home.ctaTitle")}</h2>
                <p className="mt-3 text-lg text-cream/80">{t("home.ctaText")}</p>
              </div>
              <Button href="/transparence" variant="light" size="lg" className="shrink-0">{t("home.ctaButton")}</Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ─── Page de contenu ─────────────────────────────────────────────────────────
export async function StandardPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations("common");
  const headerImg = img(page.header_image_url);
  return (
    <article>
      <PageHero eyebrow="FODECC" title={page.title} intro={(page.intro as string) || undefined} imageUrl={headerImg} />
      <Section tone="cream">
        <div className="mx-auto max-w-prose">
          <div className="mb-8"><BackLink href="/" label={t("backHome")} /></div>
          {(page.body as StreamFieldBlock[])?.length ? <StreamField blocks={page.body as StreamFieldBlock[]} /> : <p className="text-cacao-600">—</p>}
        </div>
      </Section>
    </article>
  );
}

// ─── Page de rubrique ────────────────────────────────────────────────────────
export async function IndexPageView({ page }: { page: WagtailPage }) {
  const headerImg = img(page.header_image_url);
  const children = await listPages({
    child_of: page.id,
    locale: page.meta.locale,
    limit: 60,
    // `fields` non précisé → "*" : chaque type d'enfant renvoie ses propres champs
    // sans erreur 400 (un `StandardPage` n'a pas `description`, etc.).
  });
  return (
    <div>
      <PageHero eyebrow="Rubrique" title={page.title} intro={(page.intro as string) || undefined} imageUrl={headerImg} />
      <Section tone="cream">
        {children.items.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {children.items.map((c, i) => (
              <Reveal key={c.id} delay={(i % 3) * 70}>
                <Link href={pathFromHtmlUrl(c.meta.html_url)} className="group flex h-full flex-col rounded-lg bg-white p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
                  <h3 className="font-display text-lg font-semibold text-cacao-950 group-hover:text-forest-700">{c.title}</h3>
                  {typeof (c.intro ?? c.description) === "string" && (c.intro ?? c.description) ? (
                    <p className="mt-2.5 line-clamp-3 text-cacao-900/75">{(c.intro ?? c.description) as string}</p>
                  ) : null}
                  <span className="mt-auto pt-5 text-forest-700"><ArrowSm /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-cacao-600">—</p>
        )}
      </Section>
    </div>
  );
}

// ─── Actualités ──────────────────────────────────────────────────────────────
export async function NewsIndexPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const locale = page.meta.locale;
  const list = await listNews(locale, { limit: 30 });
  const [first, ...rest] = list.items;
  return (
    <div>
      <PageHero eyebrow={t("nav.news")} title={page.title || t("news.indexTitle")} intro={(page.intro as string) || t("news.indexIntro")} />
      <Section tone="cream">
        {first ? <Reveal className="mb-10"><NewsCard article={first} locale={locale} featured /></Reveal> : null}
        {rest.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rest.map((a, i) => <Reveal key={a.id} delay={(i % 4) * 60}><NewsCard article={a} locale={locale} /></Reveal>)}
          </div>
        ) : (
          <p className="text-cacao-600">{t("news.noResults")}</p>
        )}
      </Section>
    </div>
  );
}

export async function NewsPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const fmt = await getFormatter();
  const locale = page.meta.locale;
  const cover = img(page.cover_url);
  const date = typeof page.date === "string" ? new Date(page.date) : null;
  const category = (page.category_list as Array<{ name: string }> | undefined)?.[0]?.name ?? null;
  const related = (await listNews(locale, { limit: 4 })).items.filter((a) => a.id !== page.id).slice(0, 3);

  return (
    <article>
      {cover ? (
        <header className="relative isolate overflow-hidden bg-cacao-950 text-cream">
          <Photo src={cover} className="absolute inset-0 -z-10 scale-105 opacity-90" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-cacao-950 via-cacao-950/70 to-cacao-950/30" />
          <div className="container-x flex min-h-[44vh] flex-col justify-end pb-12 pt-32 sm:min-h-[56vh]">
            <div className="max-w-3xl animate-fade-up">
              <div className="flex flex-wrap items-center gap-3 text-sm text-cream/80">
                {category ? <Badge tone="light">{category}</Badge> : null}
                {date ? <span>{fmt.dateTime(date, { dateStyle: "long" })}</span> : null}
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-cream sm:text-5xl">{page.title}</h1>
            </div>
          </div>
        </header>
      ) : (
        <header className="relative isolate overflow-hidden bg-sand">
          <Blobs variant="warm" />
          <div className="container-x pb-10 pt-16 sm:pt-24">
            <div className="max-w-3xl animate-fade-up">
              <div className="flex flex-wrap items-center gap-3 text-sm text-cacao-600">
                {category ? <Badge>{category}</Badge> : null}
                {date ? <span>{fmt.dateTime(date, { dateStyle: "long" })}</span> : null}
              </div>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-tight text-cacao-950 sm:text-5xl">{page.title}</h1>
            </div>
          </div>
        </header>
      )}

      <Section tone="cream">
        <div className="mx-auto max-w-prose">
          <div className="mb-8"><BackLink href="/actualites" label={t("common.backToList")} /></div>
          {typeof page.intro === "string" && page.intro ? (
            <p className="mb-7 font-display text-xl font-medium leading-relaxed text-cacao-900">{page.intro}</p>
          ) : null}
          <StreamField blocks={page.body as StreamFieldBlock[]} />
        </div>
      </Section>

      {related.length ? (
        <Section tone="sand" spacing="md">
          <SectionHeading eyebrow={t("nav.news")} title={t("news.relatedTitle")} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => <NewsCard key={a.id} article={a} locale={locale} />)}
          </div>
        </Section>
      ) : null}
    </article>
  );
}

// ─── Bibliothèque / transparence ─────────────────────────────────────────────
const DOC_TYPE_LABELS: Record<string, string> = {
  rapport_activite: "Rapport d'activités",
  etats_financiers: "États financiers audités",
  rapport_audit: "Rapport d'audit",
  politique: "Politique / cadre",
  texte_juridique: "Texte juridique",
  etude: "Étude / publication",
  appel_offres: "Appel d'offres",
  brochure: "Brochure / dépliant",
  autre: "Document",
};

/** Couvercles de couverture par type de publication (palette cohérente avec le brand). */
const DOC_TYPE_COVER: Record<string, { from: string; to: string; accent: string }> = {
  rapport_activite: { from: "from-cacao-800", to: "to-cacao-950", accent: "text-gold-300" },
  etats_financiers: { from: "from-forest-700", to: "to-forest-900", accent: "text-gold-300" },
  rapport_audit:    { from: "from-cacao-700", to: "to-forest-900", accent: "text-gold-300" },
  politique:        { from: "from-forest-800", to: "to-cacao-950", accent: "text-gold-300" },
  texte_juridique:  { from: "from-cacao-900", to: "to-forest-800", accent: "text-cream" },
  etude:            { from: "from-gold-700", to: "to-cacao-900", accent: "text-cream" },
  appel_offres:     { from: "from-cacao-700", to: "to-cacao-900", accent: "text-gold-300" },
  brochure:         { from: "from-gold-600", to: "to-gold-700", accent: "text-cream" },
  autre:            { from: "from-cacao-800", to: "to-cacao-950", accent: "text-gold-300" },
};

type Fmt = Awaited<ReturnType<typeof getFormatter>>;

/**
 * « Affiche de publication » — couverture verticale 3/4 façon poster institutionnel
 * (PNUD/PAM/IFAD) avec millésime en grand, type au sommet, marque FODECC en bas,
 * motifs cacao/café discrets ; le titre/description vit sous la couverture.
 */
function DocCard({ doc, openLabel, downloadLabel, fmt }: { doc: WagtailPage; openLabel: string; downloadLabel?: string; fmt?: Fmt }) {
  const href = (doc.file_url as string) || (doc.external_url as string) || pathFromHtmlUrl(doc.meta.html_url);
  const isFile = Boolean(doc.file_url) || Boolean(doc.external_url);
  const docType = (doc.document_type as string) ?? "autre";
  const typeLabel = DOC_TYPE_LABELS[docType] ?? "Document";
  const cover = DOC_TYPE_COVER[docType] ?? DOC_TYPE_COVER.autre;
  const pub = typeof doc.publication_date === "string" ? new Date(doc.publication_date) : null;
  const year = doc.year ? String(doc.year) : pub && fmt ? fmt.dateTime(pub, { year: "numeric" }) : null;
  const actionLabel = isFile && downloadLabel ? downloadLabel : openLabel;
  return (
    <a
      href={href}
      target={isFile ? "_blank" : undefined}
      rel={isFile ? "noopener noreferrer" : undefined}
      className="group flex h-full flex-col"
    >
      {/* Couverture façon « affiche » */}
      <div className={cn("relative isolate aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br shadow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover", cover.from, cover.to)}>
        {/* Décor : grain + cosse cacao discrète en filigrane */}
        <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px] text-cream" />
        <svg aria-hidden viewBox="0 0 200 200" className="absolute -right-10 -bottom-10 h-56 w-56 opacity-[0.10] text-cream">
          <path d="M100 20c30 0 60 30 60 75s-30 85-60 85-60-40-60-85S70 20 100 20z" fill="currentColor" />
          <path d="M100 30v140M80 50c10 20 30 20 40 0M75 80c12 22 38 22 50 0M72 110c14 24 42 24 56 0M75 140c12 22 38 22 50 0" stroke="rgba(33,18,8,0.45)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <div aria-hidden className="absolute inset-x-6 top-1/2 h-px -translate-y-12 bg-cream/15" />
        <div aria-hidden className="absolute inset-x-6 top-1/2 h-px translate-y-12 bg-cream/10" />

        {/* Contenu de la couverture */}
        <div className="relative flex h-full flex-col p-5 text-cream sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex items-center rounded-full border border-cream/30 bg-cream/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cream backdrop-blur-sm">
              {typeLabel}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur-sm transition-colors group-hover:bg-cream/25" aria-hidden>
              {isFile ? (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </span>
          </div>

          {/* Millésime en grand au cœur de la couverture */}
          <div className="my-auto pt-6 text-center">
            {year ? (
              <p className={cn("font-display text-[2.6rem] font-semibold leading-none tracking-tight drop-shadow-sm sm:text-[3rem]", cover.accent)}>{year}</p>
            ) : (
              <p className={cn("font-display text-xl font-semibold uppercase tracking-[0.2em]", cover.accent)}>FODECC</p>
            )}
            <p className="mx-auto mt-3 h-px w-10 bg-cream/40" aria-hidden />
            <p className="mt-3 text-[0.65rem] uppercase tracking-[0.22em] text-cream/70">Publication FODECC</p>
          </div>

          {/* Pied de couverture : marque FODECC */}
          <div className="mt-auto flex items-center gap-2.5 pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/fodecc-logo.jpeg" alt="" aria-hidden className="h-8 w-8 rounded bg-white/95 object-contain p-0.5 ring-1 ring-cream/20" />
            <div className="leading-tight">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-cream">FODECC</p>
              <p className="text-[0.6rem] uppercase tracking-[0.14em] text-cream/65">République du Cameroun</p>
            </div>
          </div>
        </div>
      </div>

      {/* Titre & action sous la couverture */}
      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="font-display text-base font-semibold leading-snug text-cacao-950 group-hover:text-forest-700 sm:text-lg">
          {doc.title}
        </h3>
        {typeof doc.description === "string" && doc.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-cacao-700">{doc.description}</p>
        ) : null}
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700">
          {isFile ? (
            <>
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden><path d="M10 3v9m0 0l-3.5-3.5M10 12l3.5-3.5M4 16h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {actionLabel}
            </>
          ) : (
            <>{actionLabel}<ArrowSm /></>
          )}
        </span>
      </div>
    </a>
  );
}

export async function LibraryIndexPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const fmt = await getFormatter();
  const list = await listLibraryItems(page.meta.locale, { limit: 60 });
  return (
    <div>
      <PageHero eyebrow={t("nav.transparency")} title={page.title || t("library.indexTitle")} intro={(page.intro as string) || t("library.indexIntro")} />
      <Section tone="cream">
        {list.items.length ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.items.map((doc, i) => (
              <Reveal key={doc.id} delay={(i % 4) * 60}>
                <DocCard doc={doc} openLabel={t("library.open")} downloadLabel={t("common.download")} fmt={fmt} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-cacao-600">{t("library.noResults")}</p>
        )}
      </Section>
    </div>
  );
}

export async function LibraryItemPageView({ page }: { page: WagtailPage }) {
  const t = await getTranslations();
  const fmt = await getFormatter();
  const fileUrl = (page.file_url as string) || (page.external_url as string) || "";
  const typeLabel = DOC_TYPE_LABELS[(page.document_type as string) ?? "autre"] ?? "Document";
  const pubDate = typeof page.publication_date === "string" ? new Date(page.publication_date) : null;
  return (
    <article>
      <PageHero eyebrow={t("nav.transparency")} title={page.title} />
      <Section tone="cream">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8"><BackLink href="/transparence" label={t("common.backToList")} /></div>
          <div className="rounded-xl bg-white p-8 shadow-card sm:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="gold">{typeLabel}</Badge>
              {page.year ? <span className="text-sm font-semibold text-cacao-600">{String(page.year)}</span> : null}
              {pubDate ? <span className="text-sm text-cacao-500">· {fmt.dateTime(pubDate, { dateStyle: "long" })}</span> : null}
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-cacao-950 sm:text-3xl">{page.title}</h1>
            {typeof page.description === "string" && page.description ? <p className="mt-4 text-lg leading-relaxed text-cacao-900/85">{page.description}</p> : null}
            {fileUrl ? <div className="mt-8"><Button href={fileUrl} external size="lg" variant="primary">{t("common.download")}</Button></div> : null}
          </div>
        </div>
      </Section>
    </article>
  );
}
