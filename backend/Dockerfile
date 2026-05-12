# syntax=docker/dockerfile:1.7-labs
# Backend Wagtail (headless) — image de production, build avec uv.

ARG PYTHON_VERSION=3.12

# ─── Étape 1 : build (résolution + install des deps via uv) ──────────────────
FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=never

WORKDIR /app

# Couche de cache : on installe d'abord les deps sans le code projet
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev


# ─── Étape 2 : runtime ───────────────────────────────────────────────────────
FROM python:${PYTHON_VERSION}-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.prod \
    PATH="/app/.venv/bin:$PATH"

# libpq pour psycopg ; libjpeg/zlib pour Pillow ; gettext pour les .mo
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 libjpeg62-turbo zlib1g curl gettext \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app /app

RUN groupadd --system app && useradd --system --gid app --create-home app \
    && mkdir -p /app/media /app/staticfiles \
    && chown -R app:app /app

USER app

EXPOSE 8000

# Le compose de prod surcharge l'entrypoint (deploy/entrypoint-prod.sh) :
# migrate + collectstatic, puis cette commande.
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "3", \
     "--timeout", "60", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
