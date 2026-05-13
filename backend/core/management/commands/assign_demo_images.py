"""
Importe des images de démonstration dans Wagtail et les répartit sur le contenu :
  - chaque NewsPage sans couverture reçoit une image (round-robin)
  - les pages de rubrique (IndexPage) et quelques StandardPage reçoivent un `header_image`
  - la HomePage reçoit une photo de l'Administrateur et la vidéo du hero

Source des images : `backend/seed_images/` (par défaut), peuplé depuis le site fodecc.cm.
Idempotent. À lancer après `bootstrap_site` + `bootstrap_demo` (+ migration des articles si voulu).

    python manage.py assign_demo_images
"""
from pathlib import Path

from django.conf import settings
from django.core.files.images import ImageFile
from django.core.management.base import BaseCommand
from django.db import transaction
from wagtail.images.models import Image as WagtailImage

from home.models import HomePage
from news.models import NewsPage
from standardpages.models import IndexPage, StandardPage

SEED_DIR_DEFAULT = Path(settings.BASE_DIR) / "seed_images"
HERO_VIDEO_PATH = "/video/fodecc.mp4"  # servi par Next depuis frontend/public/video/


class Command(BaseCommand):
    help = "Importe les images de démo et les affecte aux articles, rubriques et à la HomePage."

    def add_arguments(self, parser):
        parser.add_argument("--dir", default=str(SEED_DIR_DEFAULT), help="dossier des images source")

    @transaction.atomic
    def handle(self, *args, **options):
        seed_dir = Path(options["dir"])
        if not seed_dir.is_dir():
            self.stderr.write(f"Dossier introuvable : {seed_dir}")
            return

        # ── 1. Import des images dans Wagtail (idempotent par titre) ────────
        imgs: list[WagtailImage] = []
        dg_photo = None
        for fp in sorted(seed_dir.iterdir()):
            if fp.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            title = f"demo:{fp.stem}"
            img = WagtailImage.objects.filter(title=title).first()
            if not img:
                with fp.open("rb") as fh:
                    img = WagtailImage(title=title, file=ImageFile(fh, name=fp.name))
                    img.save()
                self.stdout.write(f"  + image  {fp.name}")
            imgs.append(img)
            if "dg-portrait" in fp.stem or "NENGUE" in fp.stem:
                dg_photo = img
        if not imgs:
            self.stderr.write("Aucune image dans le dossier source.")
            return
        landscape = [i for i in imgs if (i.width or 0) >= (i.height or 1)] or imgs

        # ── 2. Couvertures des articles (round-robin sur ceux sans cover) ───
        n = 0
        pool = landscape
        for idx, page in enumerate(NewsPage.objects.filter(cover_image__isnull=True).order_by("id")):
            page.cover_image = pool[idx % len(pool)]
            page.save_revision().publish()
            n += 1
        self.stdout.write(self.style.SUCCESS(f"  → {n} article(s) ont reçu une image de couverture"))

        # ── 3. header_image sur les rubriques et quelques pages ────────────
        targets = list(IndexPage.objects.all()) + list(
            StandardPage.objects.filter(slug__in=["notre-histoire", "missions", "gouvernance", "cadre-juridique",
                                                  "presentation", "demander-un-appui", "en-regions",
                                                  "projets", "operateurs", "partenaires-techniques-financiers",
                                                  "contact", "mot-de-l-administrateur"])
        )
        h = 0
        for idx, page in enumerate(targets):
            sp = page.specific
            if not getattr(sp, "header_image", None):
                sp.header_image = pool[idx % len(pool)]
                sp.save_revision().publish()
                h += 1
        self.stdout.write(self.style.SUCCESS(f"  → {h} page(s) ont reçu une image d'en-tête"))

        # ── 4. HomePage : photo de l'Administrateur + vidéo du hero + image hero ─
        home = HomePage.objects.filter(locale__language_code="fr").first()
        if home:
            changed = False
            if not home.admin_photo and (dg_photo or imgs):
                home.admin_photo = dg_photo or imgs[0]
                changed = True
            if not home.hero_video_url:
                home.hero_video_url = HERO_VIDEO_PATH
                changed = True
            if not home.hero_image and landscape:
                home.hero_image = landscape[len(landscape) // 2]
                changed = True
            if changed:
                home.save_revision().publish()
                self.stdout.write(self.style.SUCCESS("  → HomePage : photo du DG, vidéo et image hero renseignées"))

        self.stdout.write(self.style.SUCCESS("Images de démo affectées."))
