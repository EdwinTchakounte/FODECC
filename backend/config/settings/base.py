"""
Réglages communs du backend Wagtail (headless) du FODECC.

Modules d'environnement qui héritent de celui-ci :
  - config.settings.dev    (développement local)
  - config.settings.prod   (production : Docker / VPS Contabo)
"""
import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

# backend/config/settings/base.py -> remonte à backend/
PROJECT_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = PROJECT_DIR.parent

# Charge un éventuel .env à la racine du dépôt (../../.env) puis backend/.env
load_dotenv(BASE_DIR.parent / ".env")
load_dotenv(BASE_DIR / ".env")


def env(key, default=None):
    return os.environ.get(key, default)


# ─── Sécurité de base (surchargée par dev/production) ────────────────────────
SECRET_KEY = env("DJANGO_SECRET_KEY", "dev-insecure-change-me")
DEBUG = False
ALLOWED_HOSTS = [h for h in env("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h]


# ─── Applications ────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # apps du projet
    "home",
    "standardpages",
    "news",
    "library",
    "core",
    "search",
    # Wagtail
    "wagtail.contrib.forms",
    "wagtail.contrib.redirects",
    "wagtail.contrib.settings",
    "wagtail.contrib.sitemaps",
    "wagtail.embeds",
    "wagtail.sites",
    "wagtail.users",
    "wagtail.snippets",
    "wagtail.documents",
    "wagtail.images",
    "wagtail.search",
    "wagtail.admin",
    "wagtail.api.v2",
    "wagtail",
    # tiers
    "wagtail_localize",
    "wagtail_localize.locales",  # remplace "wagtail.locales"
    "wagtail_headless_preview",
    "rest_framework",
    "corsheaders",
    "modelcluster",
    "taggit",
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sitemaps",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "wagtail.contrib.redirects.middleware.RedirectMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [PROJECT_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "wagtail.contrib.settings.context_processors.settings",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ─── Base de données ─────────────────────────────────────────────────────────
DATABASES = {
    "default": dj_database_url.config(
        default=env("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600,
    )
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ─── Validation des mots de passe ────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ─── Internationalisation : bilingue FR / EN ─────────────────────────────────
LANGUAGE_CODE = "fr"
TIME_ZONE = "Africa/Douala"
USE_I18N = True
USE_TZ = True

LANGUAGES = [
    ("fr", "Français"),
    ("en", "English"),
]
WAGTAIL_CONTENT_LANGUAGES = LANGUAGES
WAGTAIL_I18N_ENABLED = True
LOCALE_PATHS = [PROJECT_DIR / "locale"]


# ─── Fichiers statiques et médias ────────────────────────────────────────────
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [PROJECT_DIR / "static"]
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# ─── Wagtail ─────────────────────────────────────────────────────────────────
WAGTAIL_SITE_NAME = "FODECC"
WAGTAILADMIN_BASE_URL = env("WAGTAIL_BASE_URL", "http://localhost:8000")
WAGTAIL_ALLOW_UNICODE_SLUGS = False
# Documents servis via la vue Wagtail (contrôle des permissions / redirections)
WAGTAILDOCS_SERVE_METHOD = "serve_view"

WAGTAILSEARCH_BACKENDS = {
    "default": {"BACKEND": "wagtail.search.backends.database"},
}
# L'admin du CMS est monté sous /cms/ dans config/urls.py
# (et /django-admin/ pour l'admin Django bas niveau).


# ─── API headless (Wagtail API v2) ───────────────────────────────────────────
WAGTAILAPI_BASE_URL = env("WAGTAIL_BASE_URL", "http://localhost:8000")
WAGTAILAPI_LIMIT_MAX = 100
WAGTAILAPI_SEARCH_ENABLED = True

REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}


# ─── Prévisualisation headless (brouillons rendus par Next.js) ───────────────
WAGTAIL_HEADLESS_PREVIEW = {
    "CLIENT_URLS": {
        "default": env("HEADLESS_PREVIEW_CLIENT_URL", "http://localhost:3000"),
    },
    "SERVE_BASE_URL": env("HEADLESS_PREVIEW_CLIENT_URL", "http://localhost:3000"),
    "REDIRECT_ON_PREVIEW": True,
}
PREVIEW_SECRET = env("PREVIEW_SECRET", "dev-preview-secret")


# ─── CORS : autoriser le front Next à consommer l'API ────────────────────────
CORS_ALLOWED_ORIGINS = [
    o for o in env(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",") if o
]
CORS_ALLOW_CREDENTIALS = True
