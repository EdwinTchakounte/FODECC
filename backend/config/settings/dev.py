"""Réglages de développement local."""
from .base import *  # noqa: F401,F403
from .base import BASE_DIR, env

DEBUG = True
SECRET_KEY = env("DJANGO_SECRET_KEY", "django-insecure-dev-only-key-do-not-use-in-prod")
ALLOWED_HOSTS = ["*"]

# En dev : SQLite, quoi qu'il y ait dans DATABASE_URL (.env est calibré pour Docker).
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# En dev : URLs absolues calculées d'après la requête (et non depuis WAGTAIL_BASE_URL,
# qui pointe sur le domaine de prod dans .env). Garantit que `pages/find/`, `html_url`
# et `detail_url` renvoient bien http://localhost:<port>/... pour le front local.
WAGTAILADMIN_BASE_URL = None
WAGTAILAPI_BASE_URL = None

# En dev, accepter n'importe quelle origine localhost
CORS_ALLOW_ALL_ORIGINS = True

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

try:
    import django_extensions  # noqa: F401

    INSTALLED_APPS.append("django_extensions")  # noqa: F405
except ImportError:
    pass
