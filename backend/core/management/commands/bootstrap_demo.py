"""
Remplit le CMS de contenu de démonstration (idempotent) :
  - Mot de l'Administrateur sur la HomePage
  - pages institutionnelles cibles (Le FODECC, Guichet Producteurs, Projets & partenaires,
    Contact, mentions légales…) avec un contenu plausible tiré de l'audit
  - fiches documents (rapports d'activités, dépliants, press book) pointant sur les
    PDF du site actuel fodecc.cm

À lancer après `bootstrap_site` (et, si voulu, après `scripts/migrate_content.py`) :
    python manage.py bootstrap_demo
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from wagtail.models import Locale

from home.models import HomePage
from library.models import LibraryIndexPage, LibraryItemPage
from standardpages.models import IndexPage, StandardPage


def P(*paras):
    """Construit un bloc StreamField `paragraph` à partir de plusieurs paragraphes HTML."""
    return [{"type": "paragraph", "value": "".join(f"<p>{x}</p>" for x in paras)}]

ADMIN_NAME = "Samuel Donatien NENGUE"
ADMIN_ROLE = "Administrateur / Directeur Général du FODECC"

ADMIN_QUOTE = (
    "Notre ambition est claire : faire du FODECC une institution de référence — "
    "transparente, rigoureuse et conforme aux standards internationaux — au service "
    "direct des producteurs de cacao et de café du Cameroun."
)

ADMIN_MESSAGE = P(
    "Le Fonds de Développement des Filières Cacao et Café (FODECC) traverse une période "
    "déterminante. Le décret du 14 janvier 2025 portant réorganisation et fonctionnement "
    "du Fonds nous donne un cadre rénové pour mieux remplir notre mission : mobiliser et "
    "orienter les ressources vers la recherche, la relance et la modernisation des filières "
    "cacao et café.",
    "Sous l'impulsion de ces réformes, nous avons engagé un vaste chantier institutionnel : "
    "renforcement des capacités du personnel, élaboration d'une politique environnementale et "
    "sociale, démarche de certification qualité ISO 9001, et structuration de la transparence "
    "et de la redevabilité — autant de conditions pour accéder aux financements des grands "
    "bailleurs internationaux.",
    "Au plus près du terrain, le Guichet Producteurs poursuit son déploiement dans tous les "
    "bassins de production : engrais, plants, accompagnement technique. C'est là, dans les "
    "exploitations, que se mesure l'impact réel de notre action.",
    "Je vous invite à parcourir ce site : il reflète l'engagement du FODECC et de ses partenaires "
    "pour des filières cacao et café durables, équitables et compétitives.",
)


class Command(BaseCommand):
    help = "Crée le contenu de démonstration (mot du DG, pages institutionnelles, documents)."

    @transaction.atomic
    def handle(self, *args, **options):
        fr = Locale.objects.filter(language_code="fr").first()
        if not fr:
            self.stderr.write("Aucune locale FR — lancez d'abord `bootstrap_site`.")
            return
        home = HomePage.objects.filter(locale=fr).first()
        if not home:
            self.stderr.write("Pas de HomePage — lancez d'abord `bootstrap_site`.")
            return

        # ── 1. Mot de l'Administrateur sur la HomePage ──────────────────────
        changed = False
        if not home.admin_quote:
            home.admin_quote = ADMIN_QUOTE
            changed = True
        if not home.admin_name:
            home.admin_name = ADMIN_NAME
            changed = True
        if not home.admin_role:
            home.admin_role = ADMIN_ROLE
            changed = True
        if changed:
            home.save_revision().publish()
            self.stdout.write(self.style.SUCCESS("HomePage : mot de l'Administrateur renseigné."))

        # ── helpers ─────────────────────────────────────────────────────────
        def child_by_slug(parent, slug):
            return parent.get_children().filter(slug=slug).first()

        def mk_index(parent, title, slug, intro):
            existing = child_by_slug(parent, slug)
            if existing:
                return existing.specific
            page = IndexPage(title=title, slug=slug, locale=fr, intro=intro)
            parent.add_child(instance=page)
            page.save_revision().publish()
            self.stdout.write(f"  + rubrique  {parent.slug}/{slug}")
            return page

        def mk_std(parent, title, slug, intro, body):
            existing = child_by_slug(parent, slug)
            if existing:
                return existing.specific
            page = StandardPage(title=title, slug=slug, locale=fr, intro=intro, body=body)
            parent.add_child(instance=page)
            page.save_revision().publish()
            self.stdout.write(f"  + page      {parent.slug}/{slug}")
            return page

        # ── 2. Le FODECC ────────────────────────────────────────────────────
        le_fodecc = mk_index(
            home, "Le FODECC", "le-fodecc",
            "Le Fonds de Développement des Filières Cacao et Café : sa mission, son organisation, "
            "ses textes de référence et le mot de l'Administrateur.",
        )
        mk_std(
            le_fodecc, "Notre histoire", "notre-histoire",
            "Du Fonds de Développement du Cacao et du Café à un acteur clé de la relance des filières.",
            P(
                "Le FODECC a été créé pour mobiliser des ressources dédiées au développement des "
                "filières cacao et café camerounaises : recherche variétale, appui aux producteurs, "
                "structuration des organisations professionnelles, et financement de programmes de "
                "relance portés par les ministères techniques.",
                "Le décret du 14 janvier 2025 portant réorganisation et fonctionnement du Fonds a "
                "ouvert une nouvelle étape, marquée par la modernisation de la gouvernance, le "
                "renforcement des capacités et l'alignement progressif sur les standards internationaux.",
            ),
        )
        mk_std(
            le_fodecc, "Missions & programmes", "missions",
            "Financer la recherche, accompagner les producteurs, soutenir la relance des filières.",
            P(
                "Le FODECC finance et coordonne des programmes structurants : recherche et "
                "production de matériel végétal performant (IRAD), appui direct aux producteurs via "
                "le Guichet Producteurs, projets ministériels (MINADER, MINCOMMERCE, MINRESI) et "
                "initiatives de transition agroécologique.",
                "Son action vise une filière cacao-café durable, traçable et mieux rémunératrice "
                "pour les petits producteurs, en cohérence avec les exigences des marchés "
                "internationaux (dont le Règlement sur la déforestation de l'Union européenne).",
            ),
        )
        mot = mk_std(
            le_fodecc, "Mot de l'Administrateur", "mot-de-l-administrateur",
            f"{ADMIN_NAME} — {ADMIN_ROLE}.",
            ADMIN_MESSAGE,
        )
        if not home.admin_page_url or home.admin_page_url == "/le-fodecc/mot-de-l-administrateur":
            home.admin_page_url = mot.url or "/le-fodecc/mot-de-l-administrateur"
            home.save_revision().publish()
        mk_std(
            le_fodecc, "Gouvernance & organisation", "gouvernance",
            "Comité de gestion, direction générale, départements et services, tutelle.",
            P(
                "Le FODECC est administré par un Comité de gestion et dirigé par un "
                "Administrateur / Directeur Général. Son organisation comprend des départements "
                "technique et administratif & financier, des services spécialisés (études et projets, "
                "contrôle et inspections, budget et comptabilité, recouvrement, juridique et "
                "ressources humaines) ainsi qu'une agence comptable et un contrôleur financier spécialisé.",
                "Le Fonds est placé sous la tutelle technique et financière des ministères concernés.",
            ),
        )
        mk_std(
            le_fodecc, "Cadre juridique", "cadre-juridique",
            "Textes de création et de réorganisation, codes et procédures.",
            P(
                "Le fonctionnement du FODECC repose sur un ensemble de textes : décret de "
                "réorganisation de 2025, code de bonne conduite, manuel de procédures et "
                "réglementation des filières cacao et café.",
                "Les documents téléchargeables sont regroupés dans la rubrique "
                "<a href=\"/transparence\">Transparence et redevabilité</a>.",
            ),
        )

        # ── 3. Guichet Producteurs ──────────────────────────────────────────
        gp = mk_index(
            home, "Guichet Producteurs", "guichet-producteurs",
            "Le dispositif d'appui direct aux producteurs de cacao et de café : engrais, plants, "
            "accompagnement technique, déployé dans les bassins de production.",
        )
        mk_std(
            gp, "Présentation & fonctionnement", "presentation",
            "Comment fonctionne le Guichet Producteurs, de la phase pilote à l'extension nationale.",
            P(
                "Lancé en 2020 et testé d'abord dans le Moungo, le Guichet Producteurs distribue aux "
                "producteurs enrôlés des intrants subventionnés (engrais, plants de cacao et de café) "
                "et un accompagnement technique de proximité.",
                "Le dispositif a été progressivement étendu à l'ensemble des bassins de production, "
                "avec une digitalisation de la base de données des producteurs et un suivi des "
                "campagnes de distribution.",
            ),
        )
        mk_std(
            gp, "Demander un appui", "demander-un-appui",
            "Conditions et démarches pour bénéficier des appuis en engrais et en plants.",
            P(
                "Les producteurs des filières cacao et café peuvent solliciter un appui en engrais "
                "ou en plants auprès du Guichet Producteurs, après enrôlement et vérification de "
                "leur situation.",
                "Pour connaître les modalités, les pièces à fournir et le calendrier des campagnes, "
                "rapprochez-vous du point d'accueil du Guichet Producteurs de votre région ou "
                "<a href=\"/contact\">contactez-nous</a>.",
            ),
        )
        mk_std(
            gp, "Le Guichet en régions", "en-regions",
            "Bafoussam, Bankim, Buea, Ebolowa, Abong-Mbang, Mbangassina, Melong… : le déploiement territorial.",
            P(
                "Le Guichet Producteurs s'appuie sur un réseau de points d'accueil dans les régions "
                "productrices. Les opérations de distribution et de sensibilisation y sont organisées "
                "campagne après campagne, en lien avec les autorités locales et les organisations de "
                "producteurs.",
            ),
        )

        # ── 4. Projets & partenaires ────────────────────────────────────────
        pp = mk_index(
            home, "Projets & partenaires", "projets-partenaires",
            "Les projets en cours, les opérateurs des filières et les partenaires techniques et financiers du FODECC.",
        )
        mk_std(
            pp, "Nos projets", "projets",
            "Projets ministériels et initiatives de transition agroécologique (RACINE, PAIDATA/GTAE, CANALLS…).",
            P(
                "Le FODECC porte ou accompagne plusieurs projets : projets MINADER, MINCOMMERCE et "
                "MINRESI, Guichet de Transition Agroécologique (GTAE) et son projet pilote "
                "d'appui à l'intensification durable de l'agriculture, partenariats de recherche et "
                "de traçabilité.",
            ),
        )
        mk_std(
            pp, "Opérateurs des filières", "operateurs",
            "IRAD, SODECAO, ONCC, GEX, SUACC, MINFI : les acteurs publics des filières cacao et café.",
            P(
                "Le FODECC travaille avec les opérateurs publics des filières : l'IRAD (recherche et "
                "matériel végétal), la SODECAO, l'ONCC (Office National du Cacao et du Café), le GEX, "
                "le SUACC et les administrations financières.",
            ),
        )
        mk_std(
            pp, "Partenaires techniques & financiers", "partenaires-techniques-financiers",
            "FIDA, CAFI, ICCO, Union européenne, Banque Mondiale, Fonds Vert Climat…",
            P(
                "Le FODECC développe des partenariats techniques et financiers avec des institutions "
                "internationales : FIDA, CAFI, ICCO, Union européenne, Banque Mondiale, Fonds Vert "
                "Climat, entre autres. Ces collaborations soutiennent la recherche, la durabilité "
                "environnementale et sociale, et la mise aux normes des filières.",
                "L'accès à ces financements suppose une transparence et une redevabilité exemplaires : "
                "voir la rubrique <a href=\"/transparence\">Transparence et redevabilité</a>.",
            ),
        )

        # ── 5. Pages utilitaires ────────────────────────────────────────────
        mk_std(
            home, "Contact", "contact",
            "Nous écrire, nous appeler, nous rendre visite.",
            P(
                "Pour toute information sur le FODECC, le Guichet Producteurs, les appels d'offres ou "
                "les partenariats, vous pouvez nous contacter par e-mail ou par téléphone, ou vous "
                "rendre au siège du Fonds à Yaoundé.",
                "Coordonnées détaillées et formulaire de contact : à compléter par l'administration du FODECC.",
            ),
        )
        mk_std(
            home, "Mentions légales", "mentions-legales",
            "Éditeur du site, hébergement, propriété intellectuelle.",
            P("Mentions légales du site fodecc.cm — à compléter par l'administration du FODECC."),
        )
        mk_std(
            home, "Accessibilité", "accessibilite",
            "Engagement d'accessibilité du site.",
            P(
                "Le FODECC s'engage à rendre son site accessible conformément aux standards "
                "internationaux (WCAG 2.1 AA). Cette page sera complétée avec la déclaration "
                "d'accessibilité et les coordonnées du référent.",
            ),
        )
        mk_std(
            home, "Confidentialité", "confidentialite",
            "Traitement des données personnelles.",
            P("Politique de confidentialité du site fodecc.cm — à compléter par l'administration du FODECC."),
        )

        # ── 6. Fiches documents (sous l'index Transparence) ─────────────────
        lib = LibraryIndexPage.objects.descendant_of(home).first()
        if not lib:
            self.stdout.write("  (pas d'index Transparence — `bootstrap_site` non lancé ?) — documents ignorés")
        else:
            base = "https://www.fodecc.cm/wp-content/uploads"
            docs = [
                ("Rapport d'activités 2021", "rapport-activites-2021", "rapport_activite", 2021,
                 f"{base}/2022/05/Rapport-dativites-2021-final.pdf",
                 "Rapport annuel d'activités du FODECC pour l'exercice 2021."),
                ("Activity Report 2021 (English)", "activity-report-2021-en", "rapport_activite", 2021,
                 f"{base}/2022/05/Rapport-dativites-2021-final-anglais.pdf",
                 "FODECC annual activity report 2021 — English version."),
                ("Rapport d'activités 2017", "rapport-activites-2017", "rapport_activite", 2017,
                 f"{base}/2022/05/Rapport-dactivite-2017-FODECC.pdf",
                 "Rapport d'activités du FODECC pour l'exercice 2017."),
                ("Dépliant — Guichet Producteurs (FR)", "depliant-guichet-producteurs-fr", "brochure", 2022,
                 f"{base}/2022/05/Web-fr-Depliants_Guichet-Producteurs.pdf",
                 "Présentation synthétique du Guichet Producteurs."),
                ("Leaflet — Producers' Desk (EN)", "leaflet-producers-desk-en", "brochure", 2022,
                 f"{base}/2022/07/Web-eng-Depliants_Guichet-Producteurs.pdf",
                 "Producers' Desk — overview leaflet (English)."),
                ("Press book FODECC", "press-book-fodecc", "brochure", 2022,
                 f"{base}/2022/11/Press-book-FODECC1-1.pdf",
                 "Revue de presse du FODECC."),
            ]
            for title, slug, dtype, year, url, desc in docs:
                if lib.get_children().filter(slug=slug).exists():
                    continue
                item = LibraryItemPage(
                    title=title, slug=slugify(slug)[:240], locale=fr,
                    description=desc, document_type=dtype, year=year, external_url=url,
                    legacy_url=url,
                )
                lib.add_child(instance=item)
                item.save_revision().publish()
                self.stdout.write(f"  + document  {slug}")

        # ── 7. Images : couvertures d'articles, en-têtes, photo du DG, vidéo ─
        from django.core.management import call_command
        try:
            call_command("assign_demo_images")
        except Exception as exc:  # ne bloque pas le reste si le dossier d'images manque
            self.stdout.write(f"  (images de démo ignorées : {exc})")

        self.stdout.write(self.style.SUCCESS("Contenu de démonstration en place."))
