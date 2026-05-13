# ─────────────────────────────────────────────────────────────────────────────
#  FODECC — raccourcis de développement local
#
#  Mise en route (une fois) :   make setup
#  Au quotidien (2 terminaux) :  make backend   |   make frontend
#
#  Points à tester :
#    • CMS Wagtail   →  http://localhost:8000/cms/        (admin)
#    • API + Swagger →  http://localhost:8000/api/docs/   (et /api/v2/pages/)
#    • Vitrine Next  →  http://localhost:3000/fr
# ─────────────────────────────────────────────────────────────────────────────
BACKEND := backend
FRONTEND := frontend
UVRUN := cd $(BACKEND) && uv run
DJ := DJANGO_SETTINGS_MODULE=config.settings.dev uv run python manage.py

.DEFAULT_GOAL := help
.PHONY: help up down logs setup setup-backend setup-frontend backend frontend migrate makemigrations \
        bootstrap demo dev-superuser superuser migrate-articles lint check shell clean stop

help: ## Affiche cette aide
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

## ── Docker (tout-en-un, recommandé pour juste « voir tourner ») ───────────────
up: ## Lance toute la stack en Docker (db + backend + frontend). 1re fois : --build
	docker compose up --build

down: ## Arrête la stack Docker (conserve les volumes / la base)
	docker compose down

logs: ## Affiche les logs de la stack Docker
	docker compose logs -f

## ── Dev natif (uv + npm, hot-reload) ─────────────────────────────────────────
setup: setup-backend setup-frontend bootstrap demo dev-superuser ## Installe tout + initialise le CMS + compte admin/admin
	@echo "✓ Prêt. Compte CMS : admin / admin. Dans deux terminaux : 'make backend' et 'make frontend'."

setup-backend: ## Crée le venv backend et applique les migrations (SQLite)
	cd $(BACKEND) && uv sync
	$(MAKE) migrate

setup-frontend: ## Installe les dépendances du frontend
	cd $(FRONTEND) && npm install
	@test -f $(FRONTEND)/.env.local || cp $(FRONTEND)/.env.local.example $(FRONTEND)/.env.local

backend: ## Lance le CMS / l'API Wagtail sur http://localhost:8000
	cd $(BACKEND) && DJANGO_SETTINGS_MODULE=config.settings.dev NEXT_REVALIDATE_URL= uv run python manage.py runserver 0.0.0.0:8000

frontend: ## Lance la vitrine Next.js sur http://localhost:3000
	cd $(FRONTEND) && npm run dev

migrate: ## Applique les migrations Django
	$(UVRUN) python manage.py migrate $(ARGS) 2>/dev/null || (cd $(BACKEND) && $(DJ) migrate)

makemigrations: ## Génère les migrations Django
	cd $(BACKEND) && $(DJ) makemigrations

bootstrap: ## Crée locales FR/EN + HomePage + index Actualités / Transparence
	cd $(BACKEND) && $(DJ) bootstrap_site --hostname localhost --port 8000

demo: ## Remplit le CMS de contenu (mot du DG, pages institutionnelles, documents)
	cd $(BACKEND) && $(DJ) bootstrap_demo

dev-superuser: ## Crée le compte de dev admin/admin (idempotent, dev uniquement)
	cd $(BACKEND) && $(DJ) create_dev_superuser

migrate-articles: ## Importe les 136 articles depuis ../01-audit-site-existant
	cd $(BACKEND) && DJANGO_SETTINGS_MODULE=config.settings.dev uv run python ../scripts/migrate_content.py --source ../01-audit-site-existant --apply

superuser: ## Crée un compte admin Wagtail (interactif — pour un vrai compte)
	cd $(BACKEND) && $(DJ) createsuperuser

lint: ## Lint backend (ruff) + frontend (eslint + tsc)
	cd $(BACKEND) && uv run ruff check .
	cd $(FRONTEND) && npm run lint && npm run typecheck

check: ## Vérifications Django + build frontend
	cd $(BACKEND) && $(DJ) check
	cd $(FRONTEND) && npm run build

shell: ## Shell Django (avec config.settings.dev)
	cd $(BACKEND) && $(DJ) shell

clean: ## Supprime caches et builds (garde la base SQLite)
	rm -rf $(FRONTEND)/.next $(BACKEND)/.ruff_cache $(BACKEND)/staticfiles
	find $(BACKEND) -name __pycache__ -type d -not -path '*/.venv/*' -exec rm -rf {} + 2>/dev/null || true

stop: ## Arrête les serveurs de dev éventuels (8000 / 3000)
	-@pkill -f "manage.py runserver 0.0.0.0:8000" 2>/dev/null || true
	-@pkill -f "next dev" 2>/dev/null || true
