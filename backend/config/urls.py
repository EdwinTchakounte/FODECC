from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from wagtail import urls as wagtail_urls
from wagtail.admin import urls as wagtailadmin_urls
from wagtail.contrib.sitemaps.views import sitemap
from wagtail.documents import urls as wagtaildocs_urls

from search.views import search_api

from .api import api_router

urlpatterns = [
    # Django admin (gestion bas niveau)
    path("django-admin/", admin.site.urls),
    # Admin du CMS Wagtail (rédacteurs)
    path("cms/", include(wagtailadmin_urls)),
    # Médias documentaires (PDF, etc.)
    path("documents/", include(wagtaildocs_urls)),
    # API headless v2
    path("api/v2/", api_router.urls),
    # Recherche JSON (consommée par Next)
    path("api/search/", search_api, name="search_api"),
    # Sitemap (utile pour le référencement, complète celui de Next)
    path("sitemap.xml", sitemap),
]
# Prévisualisation headless : avec wagtail-headless-preview ≥ 0.8, on ajoute le
# `HeadlessPreviewMixin` aux modèles de page et on configure WAGTAIL_HEADLESS_PREVIEW
# (cf. settings/base.py). La route /api/preview vit côté Next (Draft Mode).

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# `wagtail_urls` doit rester monté (en dernier) MÊME en headless : c'est lui qui
# définit l'URL nommée `wagtail_serve`, dont Wagtail se sert pour calculer les
# URLs de pages (`page.get_url()` → `meta.html_url` de l'API, sitemap, etc.).
# Le rendu HTML public reste fait par Next ; cette route ne sert que si l'on
# atteint directement le backend sur une URL de page (cas marginal derrière Nginx).
urlpatterns += [path("", include(wagtail_urls))]
