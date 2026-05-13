"""
Page d'accueil — racine de l'arbre de pages.

Conçue pour des parcours différenciés (producteur / partenaire / bailleur) avec
hiérarchie visuelle claire, hero vidéo, chiffres clés et appels à l'action —
points faibles identifiés dans l'audit du site actuel.
"""
from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.api import APIField
from wagtail.fields import StreamField
from wagtail.models import Page

from core.blocks import BodyStreamBlock
from core.imageutils import rendition_url


class HomePage(Page):
    # --- Hero ---
    hero_eyebrow = models.CharField(
        "Sur-titre (petit label au-dessus du titre)", max_length=80, blank=True,
        default="Fonds de Développement des Filières Cacao et Café",
    )
    hero_title = models.CharField("Titre principal", max_length=200, blank=True)
    hero_subtitle = models.TextField("Sous-titre", blank=True)
    hero_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
        verbose_name="Image du hero (poster de la vidéo / fond si pas de vidéo)",
    )
    hero_video_url = models.CharField(
        "Vidéo du hero (URL absolue ou chemin local, ex. /video/fodecc.mp4)",
        max_length=500, blank=True,
        help_text="Affichée via un bouton « Voir la vidéo » sur le bandeau d'accueil.",
    )
    hero_cta_label = models.CharField("Libellé du bouton principal", max_length=80, blank=True)
    hero_cta_url = models.CharField("Lien du bouton principal", max_length=255, blank=True)
    hero_cta2_label = models.CharField("Libellé du bouton secondaire", max_length=80, blank=True)
    hero_cta2_url = models.CharField("Lien du bouton secondaire", max_length=255, blank=True)

    # --- Mot de l'Administrateur / Directeur Général ---
    admin_quote = models.TextField("Mot de l'Administrateur — citation", blank=True)
    admin_name = models.CharField("Nom de l'Administrateur", max_length=120, blank=True)
    admin_role = models.CharField(
        "Fonction", max_length=160, blank=True, default="Administrateur / Directeur Général",
    )
    admin_photo = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
        verbose_name="Photo de l'Administrateur",
    )
    admin_page_url = models.CharField(
        "Lien « Lire le mot complet »", max_length=255, blank=True,
        default="/le-fodecc/mot-de-l-administrateur",
    )

    # --- Corps flexible (sections : chiffres clés, cartographie, etc.) ---
    body = StreamField(
        BodyStreamBlock(), blank=True, use_json_field=True, verbose_name="Sections de la page"
    )

    # --- Articles à la une (sinon : derniers articles automatiquement côté front) ---
    show_latest_news = models.BooleanField("Afficher les dernières actualités", default=True)

    @property
    def hero_image_url(self):
        return rendition_url(self.hero_image, "fill-1920x1080")

    @property
    def admin_photo_url(self):
        return rendition_url(self.admin_photo, "fill-900x1100")

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("hero_eyebrow"),
                FieldPanel("hero_title"),
                FieldPanel("hero_subtitle"),
                FieldPanel("hero_image"),
                FieldPanel("hero_video_url"),
                FieldPanel("hero_cta_label"),
                FieldPanel("hero_cta_url"),
                FieldPanel("hero_cta2_label"),
                FieldPanel("hero_cta2_url"),
            ],
            heading="Bandeau d'accueil (hero)",
        ),
        MultiFieldPanel(
            [
                FieldPanel("admin_quote"),
                FieldPanel("admin_name"),
                FieldPanel("admin_role"),
                FieldPanel("admin_photo"),
                FieldPanel("admin_page_url"),
            ],
            heading="Mot de l'Administrateur",
        ),
        FieldPanel("body"),
        FieldPanel("show_latest_news"),
    ]

    # --- Exposition headless ---
    api_fields = [
        APIField("hero_eyebrow"),
        APIField("hero_title"),
        APIField("hero_subtitle"),
        APIField("hero_image_url"),
        APIField("hero_video_url"),
        APIField("hero_cta_label"),
        APIField("hero_cta_url"),
        APIField("hero_cta2_label"),
        APIField("hero_cta2_url"),
        APIField("admin_quote"),
        APIField("admin_name"),
        APIField("admin_role"),
        APIField("admin_photo_url"),
        APIField("admin_page_url"),
        APIField("body"),
        APIField("show_latest_news"),
        APIField("locale"),
    ]

    # Une seule page d'accueil, créée à la racine
    parent_page_types = ["wagtailcore.Page"]
    subpage_types = [
        "standardpages.StandardPage",
        "standardpages.IndexPage",
        "news.NewsIndexPage",
        "library.LibraryIndexPage",
    ]

    class Meta:
        verbose_name = "Page d'accueil"
