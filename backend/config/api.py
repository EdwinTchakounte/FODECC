"""
Routeur de l'API headless Wagtail v2.

Exposé sous /api/v2/ :
  - /api/v2/pages/            liste / détail des pages (filtrable par type, locale, ...)
  - /api/v2/pages/find/?html_path=/fr/...   résolution d'une URL vers une page (utilisé par Next)
  - /api/v2/images/           images (rendition_url disponible)
  - /api/v2/documents/        documents (PDF, etc.)
"""
from wagtail.api.v2.router import WagtailAPIRouter
from wagtail.api.v2.views import PagesAPIViewSet
from wagtail.documents.api.v2.views import DocumentsAPIViewSet
from wagtail.images.api.v2.views import ImagesAPIViewSet

api_router = WagtailAPIRouter("wagtailapi")

api_router.register_endpoint("pages", PagesAPIViewSet)
api_router.register_endpoint("images", ImagesAPIViewSet)
api_router.register_endpoint("documents", DocumentsAPIViewSet)
