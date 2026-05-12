#!/bin/sh
# ─────────────────────────────────────────────────────────────────────
# Entrypoint du container `web` en production.
#
# Avant de démarrer gunicorn :
#   1. Applique les migrations (idempotent — safe à relancer)
#   2. Collecte les fichiers statiques dans /app/staticfiles (servis par Nginx)
#
# Pour un démarrage rapide en debug : ENTRYPOINT_SKIP=1
# ─────────────────────────────────────────────────────────────────────
set -e

if [ "${ENTRYPOINT_SKIP:-0}" = "1" ]; then
  echo "[entrypoint] ENTRYPOINT_SKIP=1 — skip migrate + collectstatic"
else
  echo "[entrypoint] Migrations…"
  python manage.py migrate --noinput

  echo "[entrypoint] collectstatic…"
  python manage.py collectstatic --noinput --clear
fi

echo "[entrypoint] Démarrage : $*"
exec "$@"
