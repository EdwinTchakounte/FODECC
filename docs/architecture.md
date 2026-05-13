# Architecture — refonte fodecc.cm

> Stack : **Next.js (App Router)** en frontal + **Wagtail (Django)** en CMS *headless*, PostgreSQL, déploiement Docker on-prem. Bilingue FR/EN.

## 1. Vue d'ensemble

```
                    ┌─────────────────────────────────────────────┐
                    │                  Nginx                      │
                    │  (TLS, reverse proxy unique, cache statique) │
                    └───────┬───────────────────────┬─────────────┘
                            │ /, /actualites, …      │ /cms, /api, /documents, /static, /media
                            ▼                        ▼
                   ┌─────────────────┐     ┌─────────────────────┐
                   │   Next.js       │────▶│   Wagtail (Django)  │
                   │  SSG / ISR      │ API │   Gunicorn          │
                   │  next-intl FR/EN│ v2  │   wagtail-localize  │
                   └─────────────────┘     └──────────┬──────────┘
                            ▲  revalidate              │
                            └──────────────────────────┤ ORM
                                                       ▼
                                              ┌─────────────────┐
                                              │   PostgreSQL    │
                                              └─────────────────┘
```

- **Rendu** : tout le HTML public est produit par Next.js. Wagtail ne sert **pas** de pages HTML (mode headless) — il expose son contenu via l'API REST v2 (`/api/v2/`) et une route de recherche (`/api/search/`).
- **Découplage** : les rédacteurs travaillent dans l'admin Wagtail (`/cms/`) ; la prévisualisation des brouillons s'ouvre dans Next (Draft Mode) via `wagtail-headless-preview`.
- **Performance** : Next génère les pages en SSG au build et les régénère à la demande (ISR) — invalidation poussée par Wagtail sur `page_published` → `POST /api/revalidate`. Objectif Lighthouse > 90 (l'audit estimait l'existant à 30‑45 sur mobile).
- **Sécurité** : plus de surface WordPress ; en-têtes HSTS / nosniff / X‑Frame‑Options ; admin sous `/cms/` derrière TLS ; secrets via variables d'environnement ; pile maintenue (Django LTS, Next courant).

## 2. Bilinguisme FR / EN

| Couche | Mécanisme |
|---|---|
| CMS | `WAGTAIL_I18N_ENABLED=True`, `wagtail-localize` ; chaque page a une version FR (par défaut) et EN ; traduction assistée dans l'admin. |
| API | filtre `?locale=fr` / `?locale=en` sur tous les endpoints `pages`. |
| Front | `next-intl` avec `localePrefix: 'always'` → routes `/[locale]/...` (`/fr/...`, `/en/...`) ; messages d'interface dans `frontend/src/messages/{fr,en}.json`. |
| SEO | balises `hreflang` réciproques + `canonical` générées dans `buildPageMetadata` ; à terme, alimentées par `meta.translations` de l'API pour gérer les slugs traduits. |

> **Décision à arbitrer avec l'équipe** : URL des traductions. Recommandation = arbre unique avec slugs distincts par locale ; le resolver front (`getPageByPath`) appelle `/api/v2/pages/find/?html_path=…&locale=…`. Voir TODO dans `frontend/src/lib/wagtail.ts`.

## 3. Résolution d'URL (front → CMS)

1. Requête `GET /fr/le-fodecc/notre-histoire` → middleware `next-intl` confirme la locale.
2. Route catch‑all `app/[locale]/[...path]/page.tsx` → `fetchPageForRoute('fr', ['le-fodecc','notre-histoire'])`.
3. `getPageByPath('/le-fodecc/notre-histoire/', 'fr')` → `GET {WAGTAIL_API_URL}/api/v2/pages/find/?html_path=…&locale=fr` (Wagtail redirige vers `/api/v2/pages/{id}/`) → rechargement avec `?fields=*`.
4. `PageRenderer` lit `page.meta.type` et délègue au composant correspondant (`HomePageView`, `StandardPageView`, `NewsPageView`, `LibraryItemPageView`, …).
5. Page d'accueil (`path` vide) : `GET /api/v2/pages/?type=home.HomePage&locale=fr&fields=*`.

## 4. Modèle de contenu (résumé)

Détail complet : [`content-model.md`](content-model.md).

| App Django | Modèles | Rôle |
|---|---|---|
| `home` | `HomePage` | Accueil : hero, chiffres clés, parcours, dernières actus. |
| `standardpages` | `StandardPage`, `IndexPage` | Pages éditoriales flexibles (StreamField) et pages de rubrique. |
| `news` | `NewsIndexPage`, `NewsPage`, `NewsCategory` | Actualités / presse (les 136 articles migrés). |
| `library` | `LibraryIndexPage`, `LibraryItemPage`, `DocumentTheme` | Bibliothèque & **Transparence et redevabilité** (rapports, états financiers, politiques E&S / anti‑fraude, textes). |
| `core` | blocs StreamField, `MainMenu`, `FooterSettings`, `SiteSettings`, `Partner`, signaux de revalidation | Éléments transverses. |
| `search` | vue `search_api` | Recherche JSON consommée par Next. |

Tous les modèles de page définissent `api_fields` → l'API v2 expose exactement ce dont le front a besoin (images en *renditions* dimensionnées, StreamField sérialisé en JSON).

## 5. Déploiement

**Backend** (Wagtail) → **VPS Contabo**, via `docker compose -f backend/docker-compose.prod.yml` : services `db` (PostgreSQL 16), `web` (Wagtail/Gunicorn, entrypoint = migrate + collectstatic), `nginx` (TLS Let's Encrypt), `certbot` (renouvellement auto). Domaine `backend.fodecc-vitrine.horus-lab.com` (DNS chez LWS). Sortie HTML headless : Nginx proxie `/cms/`, `/api/v2/`, `/documents/`, `/healthz/` vers `web:8000` et sert `/static/` + `/media/`. Volumes : `postgres_data`, `static_volume`, `media_volume`, `certbot_certs`, `certbot_www`. Variables : `backend/.env` (depuis `backend/.env.prod.example`).

**Frontend** (Next.js) → **Vercel**, sur `fodecc-vitrine.horus-lab.com`. Consomme `https://backend.fodecc-vitrine.horus-lab.com/api/v2/...` ; revalidation ISR poussée par Wagtail sur `page_published` (CORS + secret partagé via `.env`).

**CI/CD** : GitHub Actions. `.github/workflows/backend.yml` = `lint (ruff)` → `check (manage.py check)` → `deploy` (SSH → Contabo : `git pull` + `docker compose up --build`, cf. `backend/deploy/deploy.sh`). `frontend.yml` = typecheck → lint → build (le déploiement frontend est géré par Vercel).

Provisioning du VPS, DNS, premier déploiement, secrets GitHub, exploitation/sauvegardes : voir [`../backend/deploy/server-setup.md`](../backend/deploy/server-setup.md). Le pattern de déploiement est calqué sur `afrika_mode/backend/`.

## 6. Migration depuis l'ancien site

- Source : le dossier d'audit `../01-audit-site-existant` (données déjà scrappées : `api-data/`, `articles-fulltext/`, `images/`, `pdfs/`).
- `python manage.py bootstrap_site` puis `python scripts/migrate_content.py --source … --apply` :
  - crée un `NewsPage` par article (clé d'idempotence : `legacy_wp_id`), nettoie le HTML WordPress (suppression des shortcodes, liste blanche de balises) ;
  - importe les catégories WordPress en `NewsCategory` ;
  - option `--with-images` : importe l'image à la une depuis `images/`.
- À faire manuellement après import : restructurer la bibliothèque documentaire en rubrique « Transparence et redevabilité », créer les pages institutionnelles cibles, déclencher les traductions EN, configurer les redirections `?page_id=… → /…` (Wagtail `contrib.redirects`).

## 7. Conventions de code

- **Backend** : Django/Wagtail standard ; un module par domaine fonctionnel ; champs et `verbose_name` en français (interface des rédacteurs en français) ; pas de logique de rendu (headless).
- **Frontend** : TypeScript strict ; Server Components par défaut, `"use client"` seulement quand nécessaire (ex. `LocaleSwitcher`) ; aucun secret côté client (préfixe `NEXT_PUBLIC_` réservé aux valeurs publiques) ; Tailwind pour le style, tokens de couleur cacao/café à figer avec la DA.
- **i18n** : tout libellé d'interface passe par `next-intl` ; tout contenu éditorial vient de Wagtail.

## 8. Reste à faire (hors scaffold)

- Direction artistique / design system (maquettes, tokens, composants).
- Filtres API custom (catégorie d'actualité par slug, thématique documentaire) — extension du `PagesAPIViewSet`.
- Cartographie des interventions, tableaux de bord / KPI (peuvent être des blocs StreamField + données ou une page dédiée).
- Mécanisme de gestion des plaintes (formulaire Wagtail `contrib.forms` ou intégration dédiée).
- Accessibilité WCAG 2.1 AA (audit + corrections), tests E2E, CI/CD.
- Stratégie de cache CDN si un CDN est ajouté devant Nginx.
