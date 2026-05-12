"""
Modèles transverses : réglages de site, navigation, pied de page, partenaires.

Tout est exposé en headless :
  - les réglages via /api/v2/ (custom) ou ré-exposés par une vue dédiée — ici on
    garde les Settings accessibles via l'admin ; pour le front, on les expose
    aussi dans le contexte « site » de l'endpoint pages (voir core.api).
"""
from django.db import models
from modelcluster.fields import ParentalKey
from modelcluster.models import ClusterableModel
from wagtail.admin.panels import FieldPanel, InlinePanel, MultiFieldPanel
from wagtail.contrib.settings.models import BaseGenericSetting, register_setting
from wagtail.fields import RichTextField
from wagtail.models import Orderable
from wagtail.snippets.models import register_snippet


# ─── Navigation principale (menu) ────────────────────────────────────────────
@register_snippet
class MainMenu(ClusterableModel):
    """Menu de navigation principal du site (un par locale)."""
    title = models.CharField("Nom interne", max_length=100, default="Menu principal")

    panels = [
        FieldPanel("title"),
        InlinePanel("items", label="Entrées du menu"),
    ]

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Menu principal"
        verbose_name_plural = "Menus principaux"


class MainMenuItem(Orderable):
    menu = ParentalKey(MainMenu, on_delete=models.CASCADE, related_name="items")
    label = models.CharField("Libellé", max_length=80)
    link_page = models.ForeignKey(
        "wagtailcore.Page", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    link_url = models.CharField("Lien externe / chemin", max_length=255, blank=True)
    open_in_new_tab = models.BooleanField("Ouvrir dans un nouvel onglet", default=False)

    panels = [
        FieldPanel("label"),
        FieldPanel("link_page"),
        FieldPanel("link_url"),
        FieldPanel("open_in_new_tab"),
    ]

    @property
    def href(self):
        if self.link_page:
            return self.link_page.url
        return self.link_url


# ─── Pied de page ────────────────────────────────────────────────────────────
@register_setting
class FooterSettings(BaseGenericSetting):
    address = RichTextField("Adresse / coordonnées", blank=True, features=["bold", "link"])
    legal_text = RichTextField("Mentions légales (résumé)", blank=True, features=["bold", "link"])
    facebook = models.URLField("Facebook", blank=True)
    x_twitter = models.URLField("X / Twitter", blank=True)
    linkedin = models.URLField("LinkedIn", blank=True)
    youtube = models.URLField("YouTube", blank=True)

    panels = [
        FieldPanel("address"),
        FieldPanel("legal_text"),
        MultiFieldPanel(
            [FieldPanel("facebook"), FieldPanel("x_twitter"), FieldPanel("linkedin"), FieldPanel("youtube")],
            heading="Réseaux sociaux",
        ),
    ]

    class Meta:
        verbose_name = "Pied de page"


# ─── Réglages SEO / branding par site ────────────────────────────────────────
@register_setting
class SiteSettings(BaseGenericSetting):
    site_name = models.CharField("Nom du site", max_length=120, default="FODECC")
    default_seo_title = models.CharField("Titre SEO par défaut", max_length=120, blank=True)
    default_seo_description = models.TextField("Description SEO par défaut", blank=True)
    contact_email = models.EmailField("Email de contact", blank=True)
    phone = models.CharField("Téléphone", max_length=40, blank=True)

    panels = [
        FieldPanel("site_name"),
        FieldPanel("default_seo_title"),
        FieldPanel("default_seo_description"),
        FieldPanel("contact_email"),
        FieldPanel("phone"),
    ]

    class Meta:
        verbose_name = "Paramètres du site"


# ─── Partenaires techniques et financiers (logos) ────────────────────────────
@register_snippet
class Partner(models.Model):
    name = models.CharField("Nom", max_length=160)
    logo = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    url = models.URLField("Site web", blank=True)
    category = models.CharField(
        "Catégorie",
        max_length=40,
        choices=[
            ("ptf", "Partenaire technique et financier"),
            ("operateur", "Opérateur de filière"),
            ("institutionnel", "Partenaire institutionnel"),
        ],
        default="ptf",
    )
    sort_order = models.IntegerField("Ordre", default=0)

    panels = [
        FieldPanel("name"),
        FieldPanel("logo"),
        FieldPanel("url"),
        FieldPanel("category"),
        FieldPanel("sort_order"),
    ]

    def __str__(self):
        return self.name

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Partenaire"
