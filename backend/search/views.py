"""
Endpoint de recherche JSON pour le front Next.js : /api/search/?q=...&locale=fr

Renvoie une liste compacte de résultats (titre, URL, type, extrait) — la
recherche plein-texte s'appuie sur le backend de recherche Wagtail (base de
données par défaut ; remplaçable par PostgreSQL search ou OpenSearch en prod).
"""
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from wagtail.models import Locale, Page


@require_GET
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
            results.append({
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
            })

    return JsonResponse(
        {"query": query, "locale": locale_code, "count": len(results), "results": results}
    )
