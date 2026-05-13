"""Utilitaires images pour l'API headless."""


def rendition_url(image, spec):
    """
    URL (relative, ex. `/media/images/...`) d'une rendition Wagtail, ou None.

    On renvoie un chemin RELATIF — le frontend le préfixe avec
    `NEXT_PUBLIC_WAGTAIL_API_URL` — pour rester indépendant de `WAGTAILAPI_BASE_URL`
    (qui varie entre dev / docker / prod).
    """
    if not image:
        return None
    try:
        return image.get_rendition(spec).url
    except Exception:  # pragma: no cover — image corrompue / format non supporté
        return None
