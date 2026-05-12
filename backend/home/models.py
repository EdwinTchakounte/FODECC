"""
Page d'accueil — racine de l'arbre de pages.

Conçue pour des parcours différenciés (producteur / partenaire / bailleur) avec
hiérarchie visuelle claire, chiffres clés et appels à l'action — points faibles
identifiés dans l'audit du site actuel.
"""
from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.api import APIField
from wagtail.fields import StreamField
from wagtail.images.api.fields import ImageRenditionField
from wagtail.models import Page

from core.blocks import BodyStreamBlock


class HomePage(Page):
    # --- Hero ---
    hero_title = models.CharField("Titre principal", max_length=180, blank=True)
    hero_subtitle = models.TextField("Sous-titre", blank=True)
    hero_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    hero_cta_label = models.CharField("Libellé du bouton principal", max_length=80, blank=True)
    hero_cta_url = models.CharField("Lien du bouton principal", max_length=255, blank=True)

    # --- Corps flexible (sections : chiffres clés, parcours, cartographie, etc.) ---
    body = StreamField(BodyStreamBlock(), blank=True, use_json_field=True, verbose_name="Sections de la page")

    # --- Articles à la une (sinon : 3 plus récents automatiquement côté front) ---
    show_latest_news = models.BooleanField("Afficher les dernières actualités", default=True)

    content_panels = Page.content_panels + [
        MultiFieldPanel(
            [
                FieldPanel("hero_title"),
                FieldPanel("hero_subtitle"),
                FieldPanel("hero_image"),
                FieldPanel("hero_cta_label"),
                FieldPanel("hero_cta_url"),
            ],
            heading="Bandeau d'accueil (hero)",
        ),
        FieldPanel("body"),
        FieldPanel("show_latest_news"),
    ]

    # --- Exposition headless ---
    api_fields = [
        APIField("hero_title"),
        APIField("hero_subtitle"),
        APIField("hero_image", serializer=ImageRenditionField("fill-1600x600")),
        APIField("hero_cta_label"),
        APIField("hero_cta_url"),
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
