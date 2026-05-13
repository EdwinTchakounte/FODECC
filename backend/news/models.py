"""
Actualités / presse.

  - NewsIndexPage : page d'index « Actualités » (liste paginée, filtrable par
    catégorie/année — pagination & filtres gérés par le front via l'API).
  - NewsPage : un article. Reprend les 136 articles existants après migration.
  - NewsCategory : taxinomie simple (Actualités, Guichet Producteurs, Presse,
    Communiqués, Partenariats…).
"""
from django.db import models
from modelcluster.contrib.taggit import ClusterTaggableManager
from modelcluster.fields import ParentalKey, ParentalManyToManyField
from taggit.models import TaggedItemBase
from wagtail.admin.panels import FieldPanel, MultiFieldPanel
from wagtail.api import APIField
from wagtail.fields import StreamField
from wagtail.models import Page
from wagtail.search import index
from wagtail.snippets.models import register_snippet

from core.blocks import BodyStreamBlock
from core.imageutils import rendition_url
from standardpages.models import SEOFieldsMixin


@register_snippet
class NewsCategory(models.Model):
    name = models.CharField("Nom", max_length=120)
    slug = models.SlugField("Slug", unique=True, max_length=140)

    panels = [FieldPanel("name"), FieldPanel("slug")]

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Catégorie d'actualité"
        verbose_name_plural = "Catégories d'actualité"
        ordering = ["name"]


class NewsPageTag(TaggedItemBase):
    content_object = ParentalKey("news.NewsPage", on_delete=models.CASCADE, related_name="tagged_items")


class NewsIndexPage(SEOFieldsMixin, Page):
    intro = models.TextField("Introduction", blank=True)

    content_panels = Page.content_panels + [FieldPanel("intro")]
    promote_panels = Page.promote_panels + [
        MultiFieldPanel(SEOFieldsMixin.promote_panels_extra, heading="Référencement / partage"),
    ]

    api_fields = [
        APIField("intro"),
        APIField("search_description_long"),
        APIField("social_image_url"),
        APIField("locale"),
    ]

    parent_page_types = ["home.HomePage", "standardpages.IndexPage"]
    subpage_types = ["news.NewsPage"]

    class Meta:
        verbose_name = "Index des actualités"


class NewsPage(SEOFieldsMixin, Page):
    date = models.DateField("Date de publication")
    intro = models.TextField("Chapô", blank=True)
    cover_image = models.ForeignKey(
        "wagtailimages.Image", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    body = StreamField(BodyStreamBlock(), blank=True, use_json_field=True, verbose_name="Contenu")
    categories = ParentalManyToManyField("news.NewsCategory", blank=True, verbose_name="Catégories")
    tags = ClusterTaggableManager(through=NewsPageTag, blank=True)

    # Trace de l'origine WordPress (utile pour la migration / les redirections)
    legacy_wp_id = models.IntegerField("ID WordPress d'origine", null=True, blank=True, editable=False)
    legacy_url = models.CharField("URL d'origine", max_length=500, blank=True, editable=False)

    @property
    def category_list(self):
        return [{"id": c.id, "name": c.name, "slug": c.slug} for c in self.categories.all()]

    @property
    def tag_list(self):
        return [t.name for t in self.tags.all()]

    @property
    def cover_url(self):
        return rendition_url(self.cover_image, "fill-1280x720")

    @property
    def cover_thumb_url(self):
        return rendition_url(self.cover_image, "fill-640x420")

    search_fields = Page.search_fields + [
        index.SearchField("intro"),
        index.SearchField("body"),
        index.FilterField("date"),
    ]

    content_panels = Page.content_panels + [
        FieldPanel("date"),
        FieldPanel("cover_image"),
        FieldPanel("intro"),
        FieldPanel("body"),
        MultiFieldPanel([FieldPanel("categories"), FieldPanel("tags")], heading="Classement"),
    ]
    promote_panels = Page.promote_panels + [
        MultiFieldPanel(SEOFieldsMixin.promote_panels_extra, heading="Référencement / partage"),
    ]

    api_fields = [
        APIField("date"),
        APIField("intro"),
        APIField("cover_url"),
        APIField("cover_thumb_url"),
        APIField("body"),
        APIField("category_list"),
        APIField("tag_list"),
        APIField("search_description_long"),
        APIField("social_image_url"),
        APIField("locale"),
    ]

    parent_page_types = ["news.NewsIndexPage"]
    subpage_types = []

    class Meta:
        verbose_name = "Article d'actualité"
        ordering = ["-date"]
