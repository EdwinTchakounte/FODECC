"""
Revalidation à la demande du front Next.js (ISR).

Quand une page est publiée / dépubliée dans Wagtail, on prévient Next pour qu'il
régénère les pages concernées. L'URL et le secret sont configurés via les
variables d'environnement NEXT_REVALIDATE_URL et REVALIDATE_SECRET.
"""
import logging
import os

import requests
from django.dispatch import receiver
from wagtail.signals import page_published, page_unpublished

logger = logging.getLogger(__name__)

REVALIDATE_URL = os.environ.get("NEXT_REVALIDATE_URL", "")  # ex. http://frontend:3000/api/revalidate
REVALIDATE_SECRET = os.environ.get("REVALIDATE_SECRET", "")
TIMEOUT = 5


def _notify(path: str):
    if not REVALIDATE_URL or not REVALIDATE_SECRET:
        return
    try:
        requests.post(
            REVALIDATE_URL,
            json={"secret": REVALIDATE_SECRET, "path": path},
            timeout=TIMEOUT,
        )
    except requests.RequestException as exc:  # ne jamais casser la publication
        logger.warning("Revalidation Next échouée pour %s : %s", path, exc)


@receiver(page_published)
def on_page_published(sender, instance, **kwargs):
    _notify(instance.url or "/")


@receiver(page_unpublished)
def on_page_unpublished(sender, instance, **kwargs):
    _notify(instance.url or "/")
