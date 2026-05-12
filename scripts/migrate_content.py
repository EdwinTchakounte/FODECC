#!/usr/bin/env python
"""
Migration du contenu de l'ancien site WordPress (fodecc.cm) vers Wagtail.

Source : le dossier d'audit `../01-audit-site-existant` (données déjà scrappées) :
  - articles-fulltext/posts-full-1.json, posts-full-2.json  → contenu riche (HTML)
  - articles-fulltext/all-articles-clean.json               → repli (texte nettoyé)
  - api-data/categories.json                                → catégories WordPress
  - images/                                                 → images déjà téléchargées
  - pdfs/                                                   → PDF déjà téléchargés

Ce que fait le script :
  1. s'assure que les locales FR/EN, la HomePage et l'index « Actualités » existent ;
  2. crée/met à jour un `news.NewsPage` par article (clé : `legacy_wp_id`) ;
  3. importe les catégories WordPress en `news.NewsCategory` ;
  4. (option `--with-images`) importe l'image à la une depuis `images/` ou l'URL d'origine.

Usage :
    # depuis la racine du dépôt 02-refonte-fodecc :
    DJANGO_SETTINGS_MODULE=config.settings.dev \
        python scripts/migrate_content.py --source ../01-audit-site-existant          # dry-run
    DJANGO_SETTINGS_MODULE=config.settings.dev \
        python scripts/migrate_content.py --source ../01-audit-site-existant --apply   # écrit
    # en Docker :
    docker compose run --rm backend python /app/scripts/migrate_content.py --source /audit --apply
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote

# ─── Bootstrap Django ────────────────────────────────────────────────────────
# Marche aussi bien en local (`02-refonte-fodecc/scripts/...` → `../backend`)
# qu'en conteneur (`/app/scripts/...` → code Django à `/app`).
_HERE = Path(__file__).resolve().parent
for _candidate in (_HERE.parent / "backend", _HERE.parent, Path("/app")):
    if (_candidate / "manage.py").exists():
        sys.path.insert(0, str(_candidate))
        break
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

import django  # noqa: E402

django.setup()

from django.core.files.images import ImageFile  # noqa: E402
from django.utils.text import slugify  # noqa: E402
from wagtail.images.models import Image as WagtailImage  # noqa: E402
from wagtail.models import Locale, Page  # noqa: E402

from home.models import HomePage  # noqa: E402
from news.models import NewsCategory, NewsIndexPage, NewsPage  # noqa: E402


# ─── Utilitaires ─────────────────────────────────────────────────────────────
ALLOWED_TAGS = re.compile(
    r"</?(?:p|br|strong|b|em|i|ul|ol|li|h2|h3|h4|blockquote|a)(?:\s[^>]*)?>",
    re.IGNORECASE,
)


def clean_html(raw: str) -> str:
    """Nettoyage minimal : supprime shortcodes WP, scripts/styles, balises hors liste blanche."""
    if not raw:
        return ""
    raw = re.sub(r"\[/?[^\]]+\]", "", raw)  # shortcodes [...]
    raw = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", raw, flags=re.DOTALL | re.IGNORECASE)
    # ne garde que les balises autorisées
    out = []
    pos = 0
    for m in re.finditer(r"<[^>]+>", raw):
        out.append(html.unescape(raw[pos:m.start()]))
        if ALLOWED_TAGS.fullmatch(m.group(0)):
            out.append(m.group(0))
        pos = m.end()
    out.append(html.unescape(raw[pos:]))
    text = "".join(out)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def strip_tags(raw: str) -> str:
    return re.sub(r"<[^>]+>", "", html.unescape(raw or "")).strip()


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


def get_articles(source: Path) -> list[dict]:
    """Préfère les posts WordPress complets (HTML) ; repli sur les articles nettoyés."""
    full: list[dict] = []
    for name in ("posts-full-1.json", "posts-full-2.json"):
        data = load_json(source / "articles-fulltext" / name)
        if isinstance(data, list):
            full.extend(d for d in data if isinstance(d, dict))
    if full:
        return full
    clean = load_json(source / "articles-fulltext" / "all-articles-clean.json")
    return [d for d in clean if isinstance(d, dict)] if isinstance(clean, list) else []


def make_slug(raw_slug: str, title: str, wp_id) -> str:
    """Slug ASCII valide pour Wagtail (les slugs WP peuvent contenir du %xx encodé)."""
    candidate = slugify(unquote(raw_slug or ""))  # décode %e2%80%99 etc. puis slugifie
    if not candidate:
        candidate = slugify(title)
    if not candidate:
        candidate = f"article-{wp_id or 'sans-id'}"
    return candidate[:240]


def article_fields(a: dict) -> dict:
    """Normalise un article (format WP complet OU format nettoyé) vers un dict commun."""
    wp_id = a.get("id")
    if "content" in a:  # format WordPress complet
        title = strip_tags(a.get("title", {}).get("rendered", "")) or f"Article {wp_id}"
        body_html = clean_html(a.get("content", {}).get("rendered", ""))
        intro = strip_tags(a.get("excerpt", {}).get("rendered", ""))[:500]
        date = (a.get("date") or "")[:10]
        cats = a.get("categories", []) or []
        link = a.get("link", "")
    else:  # format nettoyé (all-articles-clean.json)
        title = a.get("title") or f"Article {wp_id}"
        text = a.get("text") or ""
        body_html = "<p>" + "</p><p>".join(p.strip() for p in text.split("\n") if p.strip()) + "</p>" if text else ""
        intro = (a.get("excerpt") or strip_tags(text))[:500]
        date = (a.get("date") or "")[:10]
        cats = []
        link = ""
    title = (title or f"Article {wp_id}").strip()[:255]
    return {
        "legacy_wp_id": wp_id, "title": title, "slug": make_slug(a.get("slug"), title, wp_id),
        "date": date or "2021-01-01", "intro": intro, "body_html": body_html,
        "wp_categories": cats, "legacy_url": link,
        "featured_media_id": a.get("featured_media"),
    }


def find_local_image(source: Path, wp_media_id, media_index: dict) -> Path | None:
    """Retrouve le fichier image local correspondant à un id de média WordPress."""
    if not wp_media_id or wp_media_id not in media_index:
        return None
    url = media_index[wp_media_id]
    filename = url.rsplit("/", 1)[-1]
    candidate = source / "images" / filename
    return candidate if candidate.exists() else None


# ─── Migration ───────────────────────────────────────────────────────────────
def run(source: Path, apply: bool, with_images: bool, limit: int | None):
    log = lambda *a: print(*a)  # noqa: E731
    mode = "APPLY" if apply else "DRY-RUN"
    log(f"=== Migration contenu FODECC [{mode}] — source : {source} ===")

    fr = Locale.objects.filter(language_code="fr").first()
    if not fr:
        log("⚠  Aucune locale FR. Lancez d'abord : python manage.py bootstrap_site")
        return
    home = HomePage.objects.filter(locale=fr).first()
    if not home:
        log("⚠  Pas de HomePage. Lancez d'abord : python manage.py bootstrap_site")
        return
    news_index = NewsIndexPage.objects.child_of(home).first()
    if not news_index:
        log("⚠  Pas d'index « Actualités ». Lancez d'abord : python manage.py bootstrap_site")
        return

    # --- Catégories ---
    wp_cats = load_json(source / "api-data" / "categories.json") or []
    if not isinstance(wp_cats, list):
        wp_cats = []
    cat_map: dict[int, NewsCategory] = {}
    for c in wp_cats:
        if not isinstance(c, dict) or not c.get("slug") or not c.get("id"):
            continue
        if c.get("slug") == "non-classe":
            continue
        if apply:
            obj, created = NewsCategory.objects.get_or_create(
                slug=c["slug"][:140], defaults={"name": c["name"][:120]}
            )
        else:
            obj = NewsCategory(slug=c["slug"], name=c["name"])
            created = True
        cat_map[c["id"]] = obj
        log(f"  catégorie {'+' if created else '='} {obj.name}")

    # --- Index des médias (id WP → source_url) ---
    media_index: dict[int, str] = {}
    api_dir = source / "api-data"
    for f in sorted(api_dir.glob("media-*.json")) if api_dir.exists() else []:
        data = load_json(f)
        if not isinstance(data, list):
            continue
        for m in data:
            if isinstance(m, dict) and m.get("id") and m.get("source_url"):
                media_index[m["id"]] = m["source_url"]
    log(f"  {len(media_index)} médias indexés")

    # --- Articles ---
    articles = get_articles(source)
    if limit:
        articles = articles[:limit]
    log(f"  {len(articles)} articles à traiter")

    created_n = updated_n = failed_n = 0
    for raw in articles:
        f = article_fields(raw)
        try:
            existing = NewsPage.objects.filter(legacy_wp_id=f["legacy_wp_id"]).first() if f["legacy_wp_id"] else None
            body = [{"type": "paragraph", "value": f["body_html"]}] if f["body_html"] else []

            if not apply:
                log(f"  [dry] {'maj' if existing else 'new'}  {f['date']}  {f['title'][:70]}")
                if existing:
                    updated_n += 1
                else:
                    created_n += 1
                continue

            cats = [cat_map[cid] for cid in f["wp_categories"] if cid in cat_map]

            if existing:
                page = existing
                page.title = f["title"]
                page.intro = f["intro"]
                page.body = body
                page.legacy_url = f["legacy_url"]
                if cats:
                    page.categories.set(cats)
                verb = "maj"
                updated_n += 1
            else:
                # slug unique sous l'index
                base_slug = f["slug"]
                slug = base_slug
                i = 2
                while NewsPage.objects.filter(slug=slug, path__startswith=news_index.path).exists():
                    slug = f"{base_slug[:230]}-{i}"
                    i += 1
                page = NewsPage(
                    title=f["title"], slug=slug, locale=fr, date=f["date"],
                    intro=f["intro"], body=body, legacy_wp_id=f["legacy_wp_id"], legacy_url=f["legacy_url"],
                )
                news_index.add_child(instance=page)  # 1er save (place la page dans l'arbre)
                if cats:
                    page.categories.set(cats)
                verb = "new"
                created_n += 1

            # image à la une (optionnel)
            if with_images and not page.cover_image:
                local = find_local_image(source, f["featured_media_id"], media_index)
                if local:
                    with local.open("rb") as fh:
                        img = WagtailImage(title=f["title"][:255], file=ImageFile(fh, name=local.name))
                        img.save()
                    page.cover_image = img

            page.save_revision().publish()  # une seule publication par article
            log(f"  {verb}  {f['date']}  {f['title'][:70]}")
        except Exception as exc:  # ne pas interrompre la migration pour un article
            failed_n += 1
            log(f"  ÉCHEC  (wp_id={f.get('legacy_wp_id')})  {f.get('title', '?')[:60]} : {exc}")

    log(f"=== Terminé : {created_n} créés, {updated_n} mis à jour, {failed_n} en échec ===")
    if not apply:
        log("    (dry-run : rien n'a été écrit ; relancez avec --apply)")


def main():
    p = argparse.ArgumentParser(description="Migration du contenu WordPress fodecc.cm vers Wagtail.")
    p.add_argument("--source", default="../01-audit-site-existant",
                   help="dossier d'audit contenant api-data/, articles-fulltext/, images/, pdfs/")
    p.add_argument("--apply", action="store_true", help="écrire réellement (sinon : simulation)")
    p.add_argument("--with-images", action="store_true", help="importer aussi les images à la une")
    p.add_argument("--limit", type=int, default=None, help="limiter le nombre d'articles (tests)")
    args = p.parse_args()

    source = Path(args.source)
    if not source.is_absolute():
        source = (Path.cwd() / source).resolve()
    if not source.exists():
        sys.exit(f"Source introuvable : {source}")

    run(source, apply=args.apply, with_images=args.with_images, limit=args.limit)


if __name__ == "__main__":
    main()
