# Modèle de contenu Wagtail

Toutes les pages héritent de `wagtail.models.Page` (titre, slug, dates de publication, SEO de base, traductions). Les modèles « contenu » ajoutent un mixin `SEOFieldsMixin` (`search_description_long`, `social_image`).

## Arbre de pages

```
Root
└── HomePage  (locale fr ; la version en est une traduction)
    ├── StandardPage / IndexPage…        ← pages institutionnelles (Le FODECC, Gouvernance, Missions, Programmes, Guichet Producteurs, Partenaires, Contact, mentions légales…)
    │   └── StandardPage / IndexPage…    ← sous-pages (récursif)
    ├── NewsIndexPage  (« Actualités »)
    │   └── NewsPage × 136…              ← articles migrés
    └── LibraryIndexPage  (« Transparence et redevabilité »)
        ├── LibraryItemPage…             ← rapports d'activités, états financiers audités, politiques (E&S, anti-fraude, plaintes), textes juridiques, études, appels d'offres, brochures
        └── LibraryIndexPage…            ← sous-rubriques éventuelles
```

## `home.HomePage`

| Champ | Type | API | Notes |
|---|---|---|---|
| `hero_title`, `hero_subtitle` | char / text | ✓ | Accroche de la page d'accueil. |
| `hero_image` | image | ✓ (`fill-1600x600`) | |
| `hero_cta_label`, `hero_cta_url` | char | ✓ | Appel à l'action principal (ex. « Demander un financement »). |
| `body` | `StreamField(BodyStreamBlock)` | ✓ | Sections : chiffres clés, parcours producteur/partenaire/bailleur, cartographie, etc. |
| `show_latest_news` | bool | ✓ | Affiche les 3 dernières actualités. |

## `standardpages.StandardPage`

Page éditoriale flexible — usage : « Notre histoire », « Missions », « Programmes », pages de gouvernance, « Plan E&S », « Politique de gestion des plaintes », « Espace partenaires », « Mécanisme de redevabilité »…

| Champ | Type | API |
|---|---|---|
| `intro` | text (chapô) | ✓ |
| `header_image` | image | ✓ (`fill-1600x500`) |
| `body` | `StreamField(BodyStreamBlock)` | ✓ |
| `search_description_long`, `social_image` | text / image | ✓ |

## `standardpages.IndexPage`

Page de rubrique : `intro` + `header_image`, liste ses enfants (rendu front). Usage : « Le FODECC », « Gouvernance », « Transparence et redevabilité » si organisée en sous-pages, etc.

## `news.*`

- **`NewsIndexPage`** : `intro`. Liste paginée / filtrable (catégorie, année, recherche) — pagination & filtres côté front via l'API.
- **`NewsPage`** :

| Champ | Type | API | Notes |
|---|---|---|---|
| `date` | date | ✓ | Date de publication éditoriale. |
| `intro` | text | ✓ | Chapô. |
| `cover_image` | image | ✓ (`fill-1200x675` + `fill-600x400` en `cover_image_thumb`) | |
| `body` | `StreamField(BodyStreamBlock)` | ✓ | Contenu de l'article. |
| `categories` | M2M `NewsCategory` | ✓ (`category_list`) | |
| `tags` | taggit | ✓ (`tag_list`) | |
| `legacy_wp_id`, `legacy_url` | int / char (non éditables) | – | Traçabilité de la migration WordPress / redirections. |

- **`NewsCategory`** (snippet) : `name`, `slug`. Catégories de départ issues de WP : *Actualités*, *FODECC* (+ à créer : *Guichet Producteurs*, *Presse*, *Communiqués*, *Partenariats*…).

## `library.*`

- **`LibraryIndexPage`** : `intro`. Liste filtrable (type, année, thématique, recherche).
- **`LibraryItemPage`** : fiche document.

| Champ | Type | API |
|---|---|---|
| `description` | text | ✓ |
| `document_type` | choix (`rapport_activite`, `etats_financiers`, `rapport_audit`, `politique`, `texte_juridique`, `etude`, `appel_offres`, `brochure`, `autre`) | ✓ |
| `year` | int | ✓ |
| `publication_date` | date | ✓ |
| `themes` | M2M `DocumentTheme` | ✓ (`theme_list`) |
| `file` | document Wagtail (PDF…) | ✓ (+ `file_url`, `file_size`) |
| `external_url` | URL | ✓ | si le document est hébergé ailleurs |
| `cover_image` | image | ✓ | vignette |
| `legacy_url` | char (non éditable) | – | |

- **`DocumentTheme`** (snippet) : `name`, `slug` (ex. *Gouvernance*, *Finances*, *Environnemental & social*, *Filière cacao*, *Filière café*, *Recherche*…).

## `core.*` (transverse)

- **`MainMenu`** (snippet + `MainMenuItem` orderable) : menu de navigation principal (libellé + page interne **ou** lien externe + ouverture nouvel onglet). À exposer au front (endpoint dédié ou via les Settings).
- **`FooterSettings`** (generic setting) : adresse, mentions légales courtes, réseaux sociaux.
- **`SiteSettings`** (generic setting) : nom du site, titre/description SEO par défaut, email, téléphone.
- **`Partner`** (snippet) : nom, logo, URL, catégorie (`ptf` / `operateur` / `institutionnel`), ordre — pour l'« Espace partenaires techniques et financiers ».

## Blocs StreamField — `core.blocks.BodyStreamBlock`

| `type` (API) | Bloc | Champs |
|---|---|---|
| `heading` | Titre | `text`, `level` (h2/h3/h4) |
| `paragraph` | Paragraphe riche | RichText (h2/h3, gras, italique, listes, lien, lien document, citation, hr) |
| `image` | Image | `image`, `caption`, `alt_text` |
| `gallery` | Galerie | liste d'`image` |
| `embed` | Média intégré | URL (oEmbed : vidéo, etc.) |
| `document` | Document à télécharger | `document`, `title`, `description` |
| `callout` | Encadré | `style` (info/success/warning), `title`, `text` |
| `cta` | Bouton d'action | `label`, `url`, `style` (primary/secondary) |
| `key_figures` | Bandeau de chiffres clés | liste de { `value`, `unit`, `label` } |
| `accordion` | Accordéon / FAQ | liste de { `question`, `answer` } |
| `table` | Tableau | `caption`, `rows` (1re ligne = en-tête) |
| `html` | HTML brut | à éviter — réservé aux cas particuliers |

Le front mappe chaque `type` dans `frontend/src/components/StreamField.tsx`. Ajouter un bloc = 1) l'ajouter à `BodyStreamBlock`, 2) ajouter un `case` dans `StreamField.tsx`.

## API headless — points d'entrée

| Endpoint | Usage |
|---|---|
| `GET /api/v2/pages/?type=…&locale=…&fields=*&limit=…&offset=…&order=…` | listes (actus, documents, enfants de rubrique) |
| `GET /api/v2/pages/find/?html_path=/…/&locale=…` | résolution URL → page (redirige vers le détail) |
| `GET /api/v2/pages/{id}/?fields=*` | détail complet d'une page |
| `GET /api/v2/images/{id}/` , `GET /api/v2/documents/{id}/` | médias |
| `GET /api/search/?q=…&locale=…&limit=…` | recherche plein-texte (JSON compact) |
| `GET /sitemap.xml` | sitemap Wagtail (complète celui de Next) |
| `POST /api/revalidate` (côté Next) | invalidation ISR poussée par Wagtail à la publication |
| `GET /api/preview` (côté Next) | active le Draft Mode (prévisualisation des brouillons) |
