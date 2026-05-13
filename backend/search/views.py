"""
Endpoint de recherche JSON pour le front Next.js : /api/search/?q=...&locale=fr

Recherche plein-texte via le backend de recherche Wagtail (base de données par
défaut ; remplaçable par PostgreSQL search ou OpenSearch en prod).
"""
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from wagtail.models import Locale, Page


@extend_schema(
    summary="Recherche plein-texte",
    description="Recherche dans les pages publiées (titre, chapô, contenu), filtrée par locale.",
    parameters=[
        OpenApiParameter("q", OpenApiTypes.STR, OpenApiParameter.QUERY, required=True, description="Termes recherchés"),
        OpenApiParameter("locale", OpenApiTypes.STR, OpenApiParameter.QUERY, description="Code de langue (fr / en). Défaut : fr."),
        OpenApiParameter("limit", OpenApiTypes.INT, OpenApiParameter.QUERY, description="Nombre maximum de résultats (≤ 50)."),
    ],
    responses=OpenApiTypes.OBJECT,
    tags=["Recherche"],
)
@api_view(["GET"])
@permission_classes([AllowAny])
def search_api(request):
    query = (request.GET.get("q") or "").strip()
    locale_code = request.GET.get("locale") or "fr"
    try:
        limit = min(int(request.GET.get("limit", 20)), 50)
    except ValueError:
        limit = 20

    results = []
    if query:
        try:
            locale = Locale.objects.get(language_code=locale_code)
        except Locale.DoesNotExist:
            locale = Locale.get_default()

        qs = Page.objects.live().public().filter(locale=locale)
        for page in qs.search(query)[:limit]:
            specific = page.specific
            results.append(
                {
                    "id": page.id,
                    "title": page.title,
                    "url": page.url,
                    "type": page.specific_class._meta.label,
                    "excerpt": (
                        getattr(specific, "intro", "")
                        or getattr(specific, "description", "")
                        or page.search_description
                        or ""
                    )[:240],
                }
            )

    return Response({"query": query, "locale": locale_code, "count": len(results), "results": results})
