#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# Déploiement du backend FODECC sur le VPS Contabo.
# Appelé par la CI (GitHub Actions, .github/workflows/backend.yml) via SSH,
# ou manuellement sur le serveur :   cd <repo>/backend && bash deploy/deploy.sh
#
# Prérequis serveur :
#   - Docker + plugin Compose (cf. deploy/init-server.sh)
#   - le dépôt cloné, ce script lancé depuis backend/ (ou via REPO_DIR)
#   - backend/.env rempli (cf. .env.prod.example)
#   - DNS du sous-domaine OK + certs TLS initialisés (cf. deploy/init-letsencrypt.sh)
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

# Racine du dépôt = deux niveaux au-dessus de ce script (backend/deploy/ → repo/)
REPO_DIR="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
BACKEND_DIR="$REPO_DIR/backend"
COMPOSE_FILE="$BACKEND_DIR/docker-compose.prod.yml"
ENV_FILE="$BACKEND_DIR/.env"
BRANCH="${DEPLOY_BRANCH:-main}"
COMPOSE="docker compose -f $COMPOSE_FILE --env-file $ENV_FILE"

echo "▶ Dépôt   : $REPO_DIR"
echo "▶ Branche : $BRANCH"
[ -f "$ENV_FILE" ] || { echo "✖ $ENV_FILE manquant — copiez .env.prod.example et remplissez-le."; exit 1; }

echo "▶ Mise à jour du code…"
git -C "$REPO_DIR" fetch --prune origin
git -C "$REPO_DIR" checkout "$BRANCH"
git -C "$REPO_DIR" reset --hard "origin/$BRANCH"

echo "▶ Build & (re)démarrage…"
$COMPOSE build --pull web
$COMPOSE up -d --remove-orphans
# migrate + collectstatic sont exécutés par deploy/entrypoint-prod.sh au démarrage du container `web`.

echo "▶ Nettoyage des images orphelines…"
docker image prune -f >/dev/null || true

echo "▶ État :"
$COMPOSE ps
echo "✅ Déploiement terminé."
