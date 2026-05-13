"""
Réglages pour la stack de DÉVELOPPEMENT en Docker Compose (racine : docker-compose.yml).

Comme `dev`, mais sans forcer SQLite : on utilise `DATABASE_URL` (PostgreSQL du compose),
pour rester proche de la production.
"""
from .base import *  # noqa: F401,F403
from .base import env

DEBUG = True
SECRET_KEY = env("DJANGO_SECRET_KEY", "django-insecure-docker-dev-only")
ALLOWED_HOSTS = ["*"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:8000", "http://127.0.0.1:8000"]

# En dev Docker : URLs absolues calculées d'après la requête (et non depuis WAGTAIL_BASE_URL).
WAGTAILADMIN_BASE_URL = None
WAGTAILAPI_BASE_URL = None

# CORS large en local
CORS_ALLOW_ALL_ORIGINS = True

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
