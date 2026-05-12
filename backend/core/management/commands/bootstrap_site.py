"""
Initialise un site FODECC vierge :
  - crée les locales FR (par défaut) et EN ;
  - remplace la « Welcome to Wagtail » par une HomePage ;
  - branche le Site Wagtail sur cette HomePage ;
  - crée les pages d'index de base (Actualités, Transparence & redevabilité).

Idempotent : peut être relancé sans danger.

    python manage.py bootstrap_site --hostname localhost --port 8000
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from wagtail.models import Locale, Page, Site

from home.models import HomePage
from library.models import LibraryIndexPage
from news.models import NewsIndexPage


class Command(BaseCommand):
    help = "Initialise l'arborescence de base du site FODECC."

    def add_arguments(self, parser):
        parser.add_argument("--hostname", default="localhost")
        parser.add_argument("--port", type=int, default=8000)

    @transaction.atomic
    def handle(self, *args, **options):
        # 1. Locales
        fr, _ = Locale.objects.get_or_create(language_code="fr")
        en, _ = Locale.objects.get_or_create(language_code="en")
        self.stdout.write(self.style.SUCCESS(f"Locales : {fr}, {en}"))

        root = Page.objects.get(depth=1)

        # 2. HomePage FR
        home = HomePage.objects.filter(locale=fr).first()
        if not home:
            # supprime l'éventuelle page d'accueil par défaut de Wagtail
            # (« Welcome to your new Wagtail site! ») — cela supprime aussi le
            # Site par défaut qui pointe dessus ; on le recrée plus bas.
            for legacy in list(root.get_children()):
                if legacy.specific_class is not HomePage:
                    legacy.delete()
            root.refresh_from_db()  # numchild était périmé après la suppression
            home = HomePage(
                title="FODECC",
                slug="home",
                locale=fr,
                hero_title="Fonds de Développement des Filières Cacao et Café",
                hero_subtitle="Au service des producteurs camerounais et des standards internationaux.",
            )
            root.add_child(instance=home)
            home.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("HomePage créée."))
        else:
            self.stdout.write("HomePage déjà présente.")

        # 3. Site Wagtail
        site, created = Site.objects.get_or_create(
            is_default_site=True,
            defaults={
                "hostname": options["hostname"],
                "port": options["port"],
                "root_page": home,
                "site_name": "FODECC",
            },
        )
        if not created:
            site.root_page = home
            site.hostname = options["hostname"]
            site.port = options["port"]
            site.save()
        self.stdout.write(self.style.SUCCESS(f"Site : {site.hostname}:{site.port} → {home}"))

        # 4. Index de base
        if not NewsIndexPage.objects.child_of(home).exists():
            idx = NewsIndexPage(title="Actualités", slug="actualites", locale=fr,
                                intro="Toute l'actualité du FODECC.")
            home.add_child(instance=idx)
            idx.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("Index « Actualités » créé."))

        if not LibraryIndexPage.objects.child_of(home).exists():
            idx = LibraryIndexPage(title="Transparence et redevabilité", slug="transparence", locale=fr,
                                   intro="Rapports d'activités, états financiers audités, politiques et textes de référence.")
            home.add_child(instance=idx)
            idx.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("Index « Transparence et redevabilité » créé."))

        self.stdout.write(self.style.SUCCESS("Bootstrap terminé."))
