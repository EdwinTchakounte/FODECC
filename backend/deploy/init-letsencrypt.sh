#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# Bootstrap initial du certificat Let's Encrypt pour le backend FODECC.
#
# Problème : Nginx démarre avec une config qui référence des certs SSL
# qui n'existent pas encore → Nginx crash, certbot ne peut pas obtenir
# de certs (car certbot a besoin de Nginx pour servir le challenge HTTP-01).
#
# Solution : ce script
#   1. Crée des certs auto-signés temporaires (Nginx démarre avec ces certs)
#   2. Lance certbot via le service Docker (challenge HTTP-01 webroot)
#   3. Recharge Nginx avec les vrais certs
#
# À exécuter UNE FOIS, depuis backend/, après avoir :
#   - configuré le DNS  backend.fodecc-vitrine.horus-lab.com → IP du VPS
#   - rempli le .env de prod
#   - lancé : docker compose -f docker-compose.prod.yml --env-file .env up -d
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."   # → backend/

# Charge le .env si présent (pour récupérer CERTBOT_DOMAIN / LETSENCRYPT_EMAIL)
[ -f .env ] && { set -a; . ./.env; set +a; }

DOMAIN="${CERTBOT_DOMAIN:-${DOMAIN:-backend.fodecc-vitrine.horus-lab.com}}"
EMAIL="${LETSENCRYPT_EMAIL:-${EMAIL:-tchambaedwin@gmail.com}}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env}"
STAGING="${STAGING:-0}"   # STAGING=1 = serveur de test Let's Encrypt (pas de quota), puis 0 pour le vrai

COMPOSE="docker compose -f ${COMPOSE_FILE} --env-file ${ENV_FILE}"

[ -f "${COMPOSE_FILE}" ] || { echo "Erreur : ${COMPOSE_FILE} introuvable. Lance ce script depuis backend/."; exit 1; }

echo "═══════════════════════════════════════════════════════════════"
echo "  Bootstrap Let's Encrypt"
echo "  Domaine : ${DOMAIN}"
echo "  Email   : ${EMAIL}"
echo "  Staging : ${STAGING} (1 = serveur de test, 0 = production)"
echo "═══════════════════════════════════════════════════════════════"

# ─── 1. Vérifie que le DNS pointe bien vers ce VPS ──────────────────
echo "[1/4] Vérification DNS…"
RESOLVED_IP=$(getent hosts "${DOMAIN}" 2>/dev/null | awk '{print $1}' | tail -1 || true)
PUBLIC_IP=$(curl -fsS ifconfig.me 2>/dev/null || curl -fsS https://api.ipify.org 2>/dev/null || true)
if [ -z "${RESOLVED_IP}" ]; then
  echo "  ⚠  ${DOMAIN} ne résout vers aucune IP. Continuer quand même ? [y/N]"; read -r a; [ "${a}" = "y" ] || exit 1
elif [ -n "${PUBLIC_IP}" ] && [ "${RESOLVED_IP}" != "${PUBLIC_IP}" ]; then
  echo "  ⚠  ${DOMAIN} → ${RESOLVED_IP}  ≠  IP du VPS ${PUBLIC_IP}. Continuer ? [y/N]"; read -r a; [ "${a}" = "y" ] || exit 1
else
  echo "  ✓ ${DOMAIN} → ${RESOLVED_IP}"
fi

# ─── 2. Certs auto-signés temporaires ───────────────────────────────
echo "[2/4] Certs auto-signés temporaires…"
${COMPOSE} run --rm --entrypoint "\
  sh -c 'mkdir -p /etc/letsencrypt/live/${DOMAIN} && \
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout /etc/letsencrypt/live/${DOMAIN}/privkey.pem \
    -out /etc/letsencrypt/live/${DOMAIN}/fullchain.pem -subj /CN=${DOMAIN}'" certbot

# ─── 3. Démarre Nginx ───────────────────────────────────────────────
echo "[3/4] Démarrage de Nginx…"
${COMPOSE} up -d nginx
sleep 5

# ─── 4. Vrai certificat ─────────────────────────────────────────────
echo "[4/4] Demande du certificat à Let's Encrypt…"
STAGING_FLAG=""; [ "${STAGING}" = "1" ] && STAGING_FLAG="--staging"
${COMPOSE} run --rm --entrypoint "\
  sh -c 'rm -rf /etc/letsencrypt/live/${DOMAIN} /etc/letsencrypt/archive/${DOMAIN} /etc/letsencrypt/renewal/${DOMAIN}.conf'" certbot
${COMPOSE} run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot ${STAGING_FLAG} \
    --email ${EMAIL} --agree-tos --no-eff-email --force-renewal -d ${DOMAIN}" certbot

echo "Reload Nginx…"
${COMPOSE} exec nginx nginx -s reload

echo
echo "═══════════════════════════════════════════════════════════════"
echo "  ✓ Certificat Let's Encrypt installé pour ${DOMAIN}"
echo "═══════════════════════════════════════════════════════════════"
echo "Test : curl -I https://${DOMAIN}/healthz/"
echo "Le service 'certbot' du compose renouvelle automatiquement (toutes les 12 h)."
