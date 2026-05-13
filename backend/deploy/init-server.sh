#!/bin/bash
# ─────────────────────────────────────────────────────────────────────
# Provisioning initial du VPS Contabo (Ubuntu 22 / 24 LTS) — backend FODECC.
#
# À exécuter UNE FOIS sur le VPS, en root, juste après la 1ère connexion :
#   scp backend/deploy/init-server.sh root@<IP>:/tmp/
#   ssh root@<IP> "bash /tmp/init-server.sh"
#
# Ce script :
#   1. Met à jour les packages
#   2. Installe Docker + plugin Compose + outils essentiels
#   3. Crée un user `deploy` (sudo NOPASSWD + groupe docker)
#   4. Configure le firewall UFW (SSH, HTTP, HTTPS uniquement)
#   5. Active fail2ban + unattended-upgrades
#
# Il NE désactive PAS le login root SSH — à faire manuellement après avoir
# vérifié que la connexion en `deploy` (avec ta clé SSH) fonctionne.
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Ce script doit être exécuté en root."; exit 1
fi

DEPLOY_USER="${DEPLOY_USER:-deploy}"

echo "═══════════════════════════════════════════════════════════════"
echo "  FODECC backend — Provisioning du VPS"
echo "═══════════════════════════════════════════════════════════════"

echo "[1/5] Mise à jour des packages…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq curl ca-certificates gnupg lsb-release ufw fail2ban htop git unattended-upgrades

echo "[2/5] Installation de Docker…"
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo "  Docker : $(docker --version)"
else
  echo "  Docker déjà présent."
fi

echo "[3/5] Création du user '${DEPLOY_USER}'…"
if ! id "${DEPLOY_USER}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${DEPLOY_USER}"
  usermod -aG sudo,docker "${DEPLOY_USER}"
  echo "${DEPLOY_USER} ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/${DEPLOY_USER}"
  chmod 0440 "/etc/sudoers.d/${DEPLOY_USER}"
  install -d -m 700 -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" "/home/${DEPLOY_USER}/.ssh"
  install -m 600 -o "${DEPLOY_USER}" -g "${DEPLOY_USER}" /dev/null "/home/${DEPLOY_USER}/.ssh/authorized_keys"
  echo "  ⚠  Ajoute la clé SSH publique (celle de la CI) dans /home/${DEPLOY_USER}/.ssh/authorized_keys"
else
  echo "  User '${DEPLOY_USER}' déjà présent."
fi

echo "[4/5] Firewall UFW…"
ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp comment 'HTTP (ACME + redirect)'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
ufw status verbose

echo "[5/5] fail2ban + unattended-upgrades…"
systemctl enable --now fail2ban
dpkg-reconfigure --priority=low unattended-upgrades || true

echo
echo "═══════════════════════════════════════════════════════════════"
echo "  ✓ Provisioning terminé"
echo "═══════════════════════════════════════════════════════════════"
echo "Suite :"
echo "  1. echo 'ssh-ed25519 AAAA… ci@fodecc' >> /home/${DEPLOY_USER}/.ssh/authorized_keys"
echo "  2. ssh ${DEPLOY_USER}@<IP>   (vérifier la connexion)"
echo "  3. Durcir SSH (en root) : PermitRootLogin no + PasswordAuthentication no dans /etc/ssh/sshd_config ; systemctl reload ssh"
echo "  4. git clone <repo> dans /home/${DEPLOY_USER}/  →  cd .../backend  →  cp .env.prod.example .env  →  remplir"
echo "  5. bash deploy/init-letsencrypt.sh   puis   bash deploy/deploy.sh"
