# Refonte fodecc.cm — Next.js + Wagtail (headless)

Refonte du site institutionnel du **FODECC** (Fonds de Développement des Filières Cacao et Café, Cameroun) — inspiration éditoriale type **UNESCO / IFAD / PAM** : grandes images, typo serif + sans, formes organiques, pleine largeur d'écran, animations sobres.

- **Backend / CMS** : [Wagtail](https://wagtail.org/) (Django) en mode *headless* — API v2 + recherche + **Swagger/OpenAPI**. Deps avec **`uv`**. Package settings : `config/` (`config.settings.{base,dev,prod}`).
- **Frontend** : [Next.js](https://nextjs.org/) (App Router, TypeScript, Tailwind) — SSG/ISR, bilingue FR/EN (`next-intl`), prévisualisation des brouillons (Draft Mode), polices *Fraunces* (display) + *Plus Jakarta Sans* (texte).
- **Déploiement** : backend sur **VPS Contabo** (`docker compose` : PostgreSQL + Gunicorn + Nginx + Certbot), CI/CD **GitHub Actions** (`backend.yml` : lint → check → deploy SSH). Frontend sur **Vercel**.
- **Contenu** : 136 articles importés depuis l'ancien site (`scripts/migrate_content.py`) + pages institutionnelles, mot de l'Administrateur et documents (rapports d'activités, dépliants, press book) créés par `manage.py bootstrap_demo`.

```
02-refonte-fodecc/
├── Makefile                    # raccourcis de dev (make setup / make backend / make frontend …)
├── backend/                    # Wagtail (Django) — pyproject.toml/uv.lock, config/, apps, deploy/, docker-compose.prod.yml
├── frontend/                   # Next.js (App Router) — déployé sur Vercel
├── scripts/migrate_content.py  # migration de contenu depuis ../01-audit-site-existant
├── docs/                       # architecture, modèle de contenu, arborescence cible
└── .github/workflows/          # backend.yml (CI/CD) · frontend.yml (CI)
```

---

## Lancer le projet en local

### Option A — Docker Compose (tout-en-un, recommandé)

```bash
docker compose up --build       # (ou : make up)
```

C'est tout. La 1re fois prend ~1 min (`uv sync` + `npm install`) ; le backend applique migrations + bootstrap + contenu de démo et **crée le compte admin automatiquement**. Ensuite :

| À tester | URL | Connexion |
|---|---|---|
| **CMS Wagtail** (admin) | http://localhost:8000/cms/ | **`admin` / `admin`** |
| **Swagger / doc de l'API** | http://localhost:8000/api/docs/ | — (Redoc : `/api/redoc/`, schéma : `/api/schema/`) |
| **API headless v2** (navigable) | http://localhost:8000/api/v2/pages/ | — |
| **Vitrine Next.js** | http://localhost:3000/fr | — (et `/en`) |
| Sonde de santé | http://localhost:8000/healthz/ | — |

Importer les 136 articles de l'ancien site (optionnel) :
```bash
docker compose exec backend uv run python /app/scripts/migrate_content.py --source /audit --apply
```
Arrêter : `docker compose down` (la base est conservée dans un volume).

### Option B — Dev natif (uv + npm, hot-reload)

```bash
make setup        # uv sync + npm install + migrations + bootstrap + contenu de démo + compte admin/admin
# puis, dans deux terminaux :
make backend      # → http://localhost:8000   (CMS + API + Swagger)
make frontend     # → http://localhost:3000   (vitrine)
make migrate-articles   # (optionnel) importe les 136 articles de l'ancien site
```

Compte CMS : **`admin` / `admin`** (créé par `make setup` ; pour un vrai compte personnel : `make superuser`).
Sans `make` : `cd backend && uv sync && uv run python manage.py migrate && uv run python manage.py bootstrap_site --hostname localhost --port 8000 && uv run python manage.py bootstrap_demo && uv run python manage.py create_dev_superuser && uv run python manage.py runserver 0.0.0.0:8000` puis, dans un autre terminal, `cd frontend && npm install && cp .env.local.example .env.local && npm run dev`.

> En dev natif, `config.settings.dev` utilise **SQLite** (zéro config). Le Docker Compose utilise **PostgreSQL** (`config.settings.docker`), au plus proche de la prod. La prod utilise `config.settings.prod` (cf. `backend/docker-compose.prod.yml`).

## Qualité

```bash
make lint     # ruff (backend) + eslint + tsc (frontend)
make check    # manage.py check + next build
```

## Déploiement

- **Backend → Contabo** : procédure complète dans [`backend/deploy/server-setup.md`](backend/deploy/server-setup.md) (provisioning VPS, DNS chez LWS, `.env`, certificats Let's Encrypt, premier déploiement). Ensuite chaque push sur `main` touchant `backend/**` déclenche `.github/workflows/backend.yml` (lint → check → déploiement SSH). Domaine : `backend.fodecc-vitrine.horus-lab.com` (CMS + API).
- **Frontend → Vercel** : connecter le dépôt à Vercel (racine `frontend/`), variables `WAGTAIL_API_URL` / `NEXT_PUBLIC_WAGTAIL_API_URL` = URL du backend, `NEXT_PUBLIC_SITE_URL` = `https://fodecc-vitrine.horus-lab.com`, `REVALIDATE_SECRET` = même secret que le backend. Domaine : `fodecc-vitrine.horus-lab.com`.

Voir aussi [`docs/`](docs/) : architecture, modèle de contenu, arborescence cible.
