"""
Bibliothèque documentaire & rubrique « Transparence et redevabilité ».

Réponse directe aux manques relevés dans l'audit (états financiers audités,
rapports annuels centralisés, politique E&S, politique anti-fraude, etc.).

  - LibraryIndexPage : page d'index « Documents stratégiques » / « Transparence »
    avec recherche et filtres (type, année, thématique) côté front.
  - LibraryItemPage : une fiche document (titre, description, fichier ou lien,
    année, type, thématique).
"""
from django.db import models
from modelcluster.fields import ParentalManyToManyField
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.api import APIField
from wagtail.models import Page
from wagtail.search import index
from wagtail.snippets.models import register_snippet

from standardpages.models import SEOFieldsMixin

DOCUMENT_TYPES = [
    ("rapport_activite", "Rapport d'activités"),
    ("etats_financiers", "États financiers audités"),
    ("rapport_audit", "Rapport d'audit"),
    ("politique", "Politique / cadre (E&S, anti-fraude, plaintes…)"),
    ("texte_juridique", "Texte juridique / réglementaire"),
    ("etude", "Étude / publication"),
    ("appel_offres", "Appel d'offres / DAO"),
    ("brochure", "Brochure / dépliant"),
    ("autre", "Autre document"),
]


@register_snippet
class DocumentTheme(models.Model):
    name = models.CharField("Thématique", max_length=140)
    slug = models.SlugField("Slug", unique=True, max_length=160)

    panels = [FieldPanel("name"), FieldPanel("slug")]

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Thématique documentaire"
        ordering = ["name"]


class LibraryIndexPage(SEOFieldsMixin, Page):
    intro = models.TextField("Introduction", blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]
    promote_panels = Page.promote_panels + [
        MultiFieldPanel(SEOFieldsMixin.promote_panels_extra, heading="Référencement / partage"),
    ]

    api_fields = [
        APIField("intro"),
        APIField("search_description_long"),
        APIField("locale"),
    ]

    parent_page_types = ["home.HomePage", "standardpages.IndexPage"]
    subpage_types = ["library.LibraryItemPage", "library.LibraryIndexPage"]

    class Meta:
        verbose_name = "Index de bibliothèque / transparence"


class LibraryItemPage(SEOFieldsMixin, Page):
    description = models.TextField("Description", blank=True)
    document_type = models.CharField("Type de document", max_length=40, choices=DOCUMENT_TYPES, default="autre")
    year = models.PositiveIntegerField("Année", null=True, blank=True)
    publication_date = models.DateField("Date de publication", null=True, blank=True)
    themes = ParentalManyToManyField("library.DocumentTheme", blank=True, verbose_name="Thématiques")

    # Soit un fichier hébergé (wagtaildocs), soit un lien externe
    file = models.ForeignKey(
        "wagtaildocs.Document", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
        verbose_name="Fichier (PDF, etc.)",
    )
    external_url = models.URLField("Lien externe (si le document est hébergé ailleurs)", blank=True)

    cover_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+",
        verbose_name="Vignette de couverture",
    )

    legacy_url = models.CharField("URL d'origine", max_length=500, blank=True, editable=False)

    @property
    def file_url(self):
        """URL de téléchargement (fichier hébergé) ou lien externe — pour l'API headless."""
        if self.file:
            return self.file.url
        return self.external_url or None

    @property
    def file_size(self):
        return self.file.file.size if self.file else None

    @property
    def theme_list(self):
        return [{"id": t.id, "name": t.name, "slug": t.slug} for t in self.themes.all()]

    search_fields = Page.search_fields + [
        index.SearchField("description"),
        index.FilterField("document_type"),
        index.FilterField("year"),
    ]

    content_panels = Page.content_panels + [
        FieldPanel("description"),
        MultiFieldPanel(
            [FieldPanel("document_type"), FieldPanel("year"), FieldPanel("publication_date"), FieldPanel("themes")],
            heading="Métadonnées",
        ),
        MultiFieldPanel([FieldPanel("file"), FieldPanel("external_url")], heading="Document"),
        FieldPanel("cover_image"),
    ]
    promote_panels = Page.promote_panels + [
        MultiFieldPanel(SEOFieldsMixin.promote_panels_extra, heading="Référencement / partage"),
    ]

    api_fields = [
        APIField("description"),
        APIField("document_type"),
        APIField("year"),
        APIField("publication_date"),
        APIField("theme_list"),
        APIField("file"),
        APIField("file_url"),
        APIField("file_size"),
        APIField("external_url"),
        APIField("cover_image"),
        APIField("locale"),
    ]

    parent_page_types = ["library.LibraryIndexPage"]
    subpage_types = []

    class Meta:
        verbose_name = "Fiche document"
        ordering = ["-year", "title"]
