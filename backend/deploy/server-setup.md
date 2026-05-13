# Déploiement du backend FODECC — VPS Contabo + CI/CD GitHub Actions

> Notes vivantes. On les remplit au fur et à mesure de la mise en route.
>
> **⚠ Ne JAMAIS écrire ici :** mot de passe root, clés privées, secrets `.env`.
> Seulement des références (où c'est stocké, comment ça se génère).

Calque du pattern `afrika_mode/backend/` : `uv` + `config/` settings + `backend/deploy/` + `docker-compose.prod.yml` (db + web + nginx + certbot) + workflow `backend.yml`.

```
        Vercel                         VPS Contabo
┌──────────────────────┐  API   ┌──────────────────────────────────────┐
│ Next.js (vitrine)    │───────▶│ Nginx (TLS Let's Encrypt)            │
│ fodecc-vitrine.      │        │  ├─ /cms/        → Wagtail (gunicorn) │
│ horus-lab.com        │◀───────│  ├─ /api/v2/…    → Wagtail            │
│   (revalidate ISR)   │  POST  │  ├─ /documents/  → Wagtail            │
└──────────────────────┘        │  ├─ /static/ /media/ → fichiers      │
                                │  └─ /healthz/    → Wagtail (sonde)   │
   GitHub Actions ──SSH───────▶ │ PostgreSQL 16 + Certbot (renew 12h)  │
   (push sur main)              │ deploy/deploy.sh : git pull + up --build
                                └──────────────────────────────────────┘
        backend.fodecc-vitrine.horus-lab.com  →  IP du VPS
```

---

## 1. Infos serveur

- **IP publique IPv4 :** `__À_RENSEIGNER__`
- **IPv6 :** `__À_RENSEIGNER__`
- **OS :** Ubuntu 22.04 / 24.04 LTS _(à confirmer après provisioning)_
- **Hostname souhaité :** `fodecc-prod` _(optionnel)_
- **Plan / datacenter Contabo :** _à compléter_

Vérifier l'OS : `cat /etc/os-release` ou `hostnamectl`.

## 2. Domaines & DNS

- **Frontend (Vercel)** : `fodecc-vitrine.horus-lab.com`
- **Backend (ce VPS)** : `backend.fodecc-vitrine.horus-lab.com`
- **Registrar / DNS pour `horus-lab.com` :** LWS (`panel.lws.fr`)

> Le nom `backend.fodecc-vitrine.horus-lab.com` apparaît dans : `deploy/nginx/default.conf`,
> `deploy/init-letsencrypt.sh` (valeur par défaut), `.env` (`DJANGO_ALLOWED_HOSTS`,
> `DJANGO_CSRF_TRUSTED_ORIGINS`, `WAGTAIL_BASE_URL`, `CERTBOT_DOMAIN`).

### Record DNS à créer dans la zone `horus-lab.com` (LWS)

| Type | Nom (relatif à la zone) | Pointeur | TTL |
|---|---|---|---|
| A | `backend.fodecc-vitrine` | `__IP_DU_VPS__` | 300 (puis 3600 une fois stable) |

Vérif (propagation ~5–30 min) : `dig backend.fodecc-vitrine.horus-lab.com +short` → doit renvoyer l'IP du VPS.
(Le frontend `fodecc-vitrine.horus-lab.com` pointe vers Vercel selon ce qu'indique Vercel — CNAME `cname.vercel-dns.com` en général.)

## 3. Provisioning du VPS (une fois, en root)

```bash
scp backend/deploy/init-server.sh root@<IP>:/tmp/
ssh root@<IP> "bash /tmp/init-server.sh"
# → installe Docker + plugin Compose, crée le user `deploy` (sudo NOPASSWD + docker),
#   firewall UFW (22/80/443), fail2ban, unattended-upgrades.
```

Puis :
```bash
# clé SSH de la CI : générer une paire dédiée et mettre la PUBLIQUE sur le serveur
ssh-keygen -t ed25519 -f ~/.ssh/fodecc_ci -N "" -C "ci@fodecc"
# (sur le VPS, en root) :
echo "ssh-ed25519 AAAA… ci@fodecc" >> /home/deploy/.ssh/authorized_keys
# vérifier : ssh deploy@<IP>
# puis durcir : PermitRootLogin no + PasswordAuthentication no dans /etc/ssh/sshd_config ; systemctl reload ssh
```

## 4. Premier déploiement (manuel, sur le VPS en tant que `deploy`)

```bash
git clone git@github.com:__ORG__/__REPO__.git ~/fodecc-refonte   # deploy key GitHub si repo privé
cd ~/fodecc-refonte/backend
cp .env.prod.example .env && nano .env          # remplir tous les __…__ (secrets, domaine, CORS Vercel)
chmod +x deploy/*.sh

# certs TLS (DNS doit déjà pointer ; tester d'abord en staging)
STAGING=1 bash deploy/init-letsencrypt.sh       # essai
bash deploy/init-letsencrypt.sh                 # le vrai

# toute la stack + migrations + collectstatic
bash deploy/deploy.sh

# compte admin Wagtail
docker compose -f docker-compose.prod.yml --env-file .env exec web python manage.py createsuperuser
# arbre de base (locales FR/EN + HomePage + index Actualités/Transparence) :
docker compose -f docker-compose.prod.yml --env-file .env exec web \
  python manage.py bootstrap_site --hostname backend.fodecc-vitrine.horus-lab.com --port 443
```

Vérifs :
- `curl -I https://backend.fodecc-vitrine.horus-lab.com/healthz/` → `200`
- `https://backend.fodecc-vitrine.horus-lab.com/cms/` → login Wagtail
- `https://backend.fodecc-vitrine.horus-lab.com/api/v2/pages/` → JSON

> Pour la **migration des 136 articles** : le plus simple est de la faire en local
> (`python scripts/migrate_content.py --apply`) puis de transférer la base
> (`pg_dump` → `pg_restore`). Sinon copier `scripts/` + le dossier d'audit sur le
> serveur et lancer le script dans le container `web`.

## 5. CI/CD — GitHub Actions

Workflow : `.github/workflows/backend.yml` → jobs `lint (ruff)` → `check (manage.py check)` → `deploy (SSH→Contabo)` sur push `main` touchant `backend/**`.

**Secrets** (GitHub → Settings → Secrets and variables → Actions) :

| Nom | Valeur |
|---|---|
| `CONTABO_HOST` | IP du VPS |
| `CONTABO_USER` | `deploy` |
| `CONTABO_SSH_KEY` | contenu de `~/.ssh/fodecc_ci` (clé **privée**, multi-lignes) |
| `CONTABO_SSH_PORT` | `22` (ou autre) — optionnel |

**Variables** :

| Nom | Valeur |
|---|---|
| `DEPLOY_PATH` | `/home/deploy/fodecc-refonte` |

## 6. Côté Vercel (frontend)

Variables d'environnement du projet Vercel :

| Nom | Valeur |
|---|---|
| `WAGTAIL_API_URL` | `https://backend.fodecc-vitrine.horus-lab.com` |
| `NEXT_PUBLIC_WAGTAIL_API_URL` | `https://backend.fodecc-vitrine.horus-lab.com` |
| `NEXT_PUBLIC_SITE_URL` | `https://fodecc-vitrine.horus-lab.com` |
| `REVALIDATE_SECRET` | le **même** que `PREVIEW_SECRET`/`REVALIDATE_SECRET` du `.env` Contabo |

Et bien renseigner côté Contabo (`.env`) : `CORS_ALLOWED_ORIGINS=https://fodecc-vitrine.horus-lab.com` (+ URLs `*.vercel.app` de preview si besoin) et `NEXT_REVALIDATE_URL=https://fodecc-vitrine.horus-lab.com/api/revalidate`. Penser aussi à ajouter `backend.fodecc-vitrine.horus-lab.com` dans `frontend/next.config.mjs` (`images.remotePatterns`).

## 7. Exploitation

```bash
cd ~/fodecc-refonte/backend
C="docker compose -f docker-compose.prod.yml --env-file .env"
$C ps                    # état
$C logs -f web            # logs Wagtail
$C exec web python manage.py shell
# Sauvegarde base + médias
$C exec -T db pg_dump -U fodecc fodecc | gzip > ~/backup-fodecc-$(date +%F).sql.gz
docker run --rm -v fodecc-backend_media_volume:/m -v ~/:/b alpine tar czf /b/media-$(date +%F).tgz -C /m .
```

## 8. Journal

- `2026-05-12` — Structure de déploiement créée (calquée sur `afrika_mode/backend/`) : migration vers `uv`, package settings renommé `fodecc/`→`config/` (settings `config.settings.{base,dev,prod}`), `backend/deploy/*`, `docker-compose.prod.yml`, workflow `backend.yml`. VPS pas encore provisionné.
