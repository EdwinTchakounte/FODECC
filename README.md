# Refonte fodecc.cm — Next.js + Wagtail (headless)

Refonte du site institutionnel du **FODECC** (Fonds de Développement des Filières Cacao et Café, Cameroun).

- **Backend / CMS** : [Wagtail](https://wagtail.org/) (Django) en mode *headless* — expose les pages et contenus via l'API v2.
- **Frontend** : [Next.js](https://nextjs.org/) (App Router, TypeScript, Tailwind) — rend tout le site, SSG/ISR, prévisualisation des brouillons.
- **Bilingue FR / EN** : `wagtail-localize` côté CMS + routing `/[locale]/...` (`next-intl`) côté front.
- **Déploiement** : on‑premise / Cameroun via `docker compose` (PostgreSQL + Gunicorn + Next.js + Nginx).
- **Migration** : `scripts/migrate_content.py` importe les 136 articles + médias depuis `../01-audit-site-existant`.

```
02-refonte-fodecc/
├── backend/        # Wagtail (Django)
├── frontend/       # Next.js (App Router)
├── scripts/        # migration de contenu depuis l'ancien site
├── deploy/         # nginx, configs de déploiement
├── docs/           # architecture, modèle de contenu, arborescence cible
├── docker-compose.yml
└── .env.example
```

## Démarrage rapide (développement)

```bash
cp .env.example .env

# --- Backend ---
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations           # génère les migrations des apps du projet
python manage.py migrate
python manage.py bootstrap_site           # crée locales FR/EN + HomePage + index de base
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
#  → admin Wagtail : http://localhost:8000/cms/
#  → API v2        : http://localhost:8000/api/v2/pages/

# --- Frontend ---
cd ../frontend
npm install
cp .env.local.example .env.local   # pointe NEXT_PUBLIC_WAGTAIL_API_URL vers http://localhost:8000
npm run dev
#  → site : http://localhost:3000/fr
```

## Démarrage via Docker (cible on‑prem)

```bash
cp .env.example .env       # éditer les secrets / hôtes
docker compose up --build
#  → site public : http://localhost  (nginx → next)
#  → admin CMS   : http://localhost/cms/  (nginx → wagtail)
```

## Migration du contenu existant

```bash
# 1. initialiser l'arborescence de base (locales FR/EN, HomePage, index Actualités/Transparence)
docker compose run --rm backend python manage.py bootstrap_site --hostname fodecc.cm --port 80

# 2. simuler la migration des 136 articles
docker compose run --rm backend python scripts/migrate_content.py --source /audit

# 3. migrer pour de vrai (avec les images à la une)
docker compose run --rm backend python scripts/migrate_content.py --source /audit --apply --with-images
```

En local (hors Docker) : `python manage.py bootstrap_site` puis
`DJANGO_SETTINGS_MODULE=fodecc.settings.dev python scripts/migrate_content.py --source ../01-audit-site-existant --apply`.

Voir [`docs/`](docs/) pour l'architecture détaillée, le modèle de contenu et l'arborescence cible.
# FODECC
