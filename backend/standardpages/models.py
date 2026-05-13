"""
Pages de contenu génériques.

  - StandardPage : page éditoriale flexible (StreamField) — sert pour
    « Notre histoire », « Missions », « Programmes », la gouvernance,
    « Transparence et redevabilité », « Mécanisme de gestion des plaintes »,
    « Espace partenaires », etc.
  - IndexPage : page de rubrique listant ses sous-pages (ex. « Gouvernance »,
    « Transparence et redevabilité »).
"""
from django.db import models
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.api import APIField
from wagtail.fields import StreamField
from wagtail.models import Page
from wagtail.search import index

from core.blocks import BodyStreamBlock
from core.imageutils import rendition_url


class SEOFieldsMixin(models.Model):
    """Champs SEO communs (le `seo_title` natif de Wagtail est conservé en plus)."""
    search_description_long = models.TextField(
        "Méta-description (160 car. max recommandé)", blank=True
    )
    social_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL,
        related_name="+", verbose_name="Image de partage (Open Graph)",
    )

    promote_panels_extra = [
        FieldPanel("search_description_long"),
        FieldPanel("social_image"),
    ]

    @property
    def social_image_url(self):
        return rendition_url(self.social_image, "fill-1200x630")

    class Meta:
        abstract = True


class StandardPage(SEOFieldsMixin, Page):
    intro = models.TextField("Chapô / introduction", blank=True)
    header_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
        verbose_name="Image d'en-tête",
    )
    body = StreamField(BodyStreamBlock(), blank=True, use_json_field=True, verbose_name="Contenu")

    @property
    def header_image_url(self):
        return rendition_url(self.header_image, "fill-1920x720")

    search_fields = Page.search_fields + [
        index.SearchField("intro"),
        index.SearchField("body"),
    ]

    content_panels = Page.content_panels + [
        FieldPanel("header_image"),
        FieldPanel("intro"),
        FieldPanel("body"),
    ]
    promote_panels = Page.promote_panels + [
        MultiFieldPanel(SEOFieldsMixin.promote_panels_extra, heading="Référencement / partage"),
    ]

    api_fields = [
        APIField("intro"),
        APIField("header_image_url"),
        APIField("body"),
        APIField("search_description_long"),
        APIField("social_image_url"),
        APIField("locale"),
    ]

    subpage_types = ["standardpages.StandardPage", "standardpages.IndexPage"]

    class Meta:
        verbose_name = "Page de contenu"


class IndexPage(SEOFieldsMixin, Page):
    """Page de rubrique : intro + liste de ses enfants (rendue par le front)."""
    intro = models.TextField("Introduction de la rubrique", blank=True)
    header_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
        verbose_name="Image d'en-tête",
    )

    @property
    def header_image_url(self):
        return rendition_url(self.header_image, "fill-1920x720")

    content_panels = Page.content_panels + [
        FieldPanel("header_image"),
        FieldPanel("intro"),
    ]
    promote_panels = Page.promote_panels + [
        MultiFieldPanel(SEOFieldsMixin.promote_panels_extra, heading="Référencement / partage"),
    ]

    api_fields = [
        APIField("intro"),
        APIField("header_image_url"),
        APIField("search_description_long"),
        APIField("social_image_url"),
        APIField("locale"),
    ]

    subpage_types = ["standardpages.StandardPage", "standardpages.IndexPage"]

    class Meta:
        verbose_name = "Page de rubrique"
