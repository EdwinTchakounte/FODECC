# Arborescence cible & mapping de migration

> Proposition d'architecture de l'information pour le nouveau site, dérivée de l'audit (`../01-audit-site-existant/AUDIT-fodecc-cm.md`) et des exigences du TDR. À valider avec le FODECC. Bilingue FR/EN — slugs EN entre parenthèses.

## 1. Navigation principale (cible)

```
Accueil  (/)                                            HomePage
│
├── Le FODECC  (/le-fodecc · /about)                    IndexPage
│   ├── Notre histoire        (/le-fodecc/notre-histoire)            StandardPage   ← "Notre histoire", "FONDS"
│   ├── Missions & programmes  (/le-fodecc/missions)                  StandardPage   ← "Missions", "Programmes"
│   ├── Mot de l'Administrateur (/le-fodecc/mot-de-l-administrateur)  StandardPage   ← "Mot de l'administrateur" (×3 → 1)
│   ├── Gouvernance & organisation (/le-fodecc/gouvernance)           IndexPage      ← 20 pages "Gouvernance & organisation"
│   │   ├── Comité de gestion          (.../comite-de-gestion)        StandardPage
│   │   ├── Administration / Direction (.../administration)           StandardPage   ← "Administration", "Notre équipe dirigeante", "Notre organisation"
│   │   ├── Tutelle                    (.../tutelle)                  StandardPage   ← "Notre tutelle"
│   │   ├── Départements & services    (.../departements-services)    StandardPage   ← "Département administratif et financier", "Département technique", services…
│   │   └── Contrôle financier & agence comptable (.../controle-comptabilite) StandardPage ← "Contrôleur financier spécialisé", "Agence comptabilité"
│   └── Cadre juridique  (/le-fodecc/cadre-juridique)                 StandardPage   ← "Cadre juridique", "Textes et lois", "Nos codes", décret de réorganisation 2025
│
├── Guichet Producteurs  (/guichet-producteurs · /producers-desk)    IndexPage      ← "Guichet producteurs" + 14 pages "Producteurs"
│   ├── Présentation & fonctionnement (.../presentation)             StandardPage
│   ├── Demander un appui (engrais, plants) (.../demander-un-appui)  StandardPage   ← "Demande d'appui en engrais", "Demande d'appui en plants cacao/café", "Accès aux appuis des projets"  (+ CTA)
│   ├── Le Guichet en régions          (.../en-regions)              StandardPage   ← "The Producer's Desk in …" (Bafoussam, Bankim, Buea, Ebolowa, Abong-Mbang, Mbangassina, Melong…)
│   ├── Guichet de Transition Agroécologique (.../transition-agroecologique) StandardPage ← articles GTAE / PRODOC / PAIDATA
│   └── Dossier de presse              (.../dossier-de-presse)       LibraryItemPage / StandardPage ← "Dossier de presse du Guichet Producteurs"
│
├── Projets & partenaires  (/projets-partenaires)                    IndexPage
│   ├── Nos projets (RACINE, PAIDATA/GTAE, CANALLS…) (.../projets)   StandardPage   ← "Projets MINADER/MINCOMMERCE/MINRESI" + articles projets
│   ├── Opérateurs des filières (.../operateurs)                     StandardPage   ← "Opérateurs filières" : SODECAO, IRAD, ONCC, GEX, SUACC, MINFI
│   └── Partenaires techniques & financiers (.../partenaires-techniques-financiers) StandardPage (+ snippets `Partner`) ← "Partenaires" (FIDA, CAFI, ICCO, UE, KPMG…)  [NOUVEAU — exigé TDR]
│
├── Transparence & redevabilité  (/transparence · /transparency)     LibraryIndexPage  [NOUVEAU — exigé TDR]
│   ├── Rapports d'activités  (.../rapports-activites)               LibraryItemPage × n  ← "Rapports d'activités", "Rapport-dactivite-2017", "Rapport d'activités 2021"…
│   ├── États financiers audités (.../etats-financiers)             LibraryItemPage × n  ← "Etats financiers", "Comptes administratifs", "Compte de gestion (matière)", "Rapports financiers"
│   ├── Politiques & sauvegardes (.../politiques)                    LibraryItemPage × n  ← Plan E&S / PGES, politique anti-fraude & anti-corruption  [À PRODUIRE]
│   ├── Mécanisme de gestion des plaintes (.../mecanisme-plaintes)   StandardPage + formulaire  [NOUVEAU — exigé TDR]
│   ├── Marchés publics & appels d'offres (.../appels-offres)        LibraryIndexPage     ← "Appels d'offres"
│   └── Données ouvertes (.../open-data)                             StandardPage         ← jeux de données enrôlement producteurs, etc.  [NOUVEAU]
│
├── Suivi & réalisations  (/suivi-realisations)                      StandardPage / IndexPage  [NOUVEAU — exigé TDR]
│   ├── Chiffres clés & impacts (.../chiffres-cles)                  StandardPage (blocs `key_figures`)
│   ├── Cartographie des interventions (.../cartographie)           StandardPage (carte)  [NOUVEAU]
│   └── Études & publications (.../etudes-publications)              LibraryIndexPage      ← "Documents stratégiques" : plan de relance 2020, réforme filière, libéralisation, ACRAOC…
│
├── Actualités & médias  (/actualites · /news)                       NewsIndexPage         ← "Actualité" + 136 articles
│   ├── Communiqués & presse (.../presse)                            (catégorie d'actus)   ← "Presse", "Presse écrite", "Presse audiovisuelle"
│   ├── Agenda / événements (.../agenda)                             StandardPage          ← "Agenda"
│   ├── Photothèque (.../phototheque)                                StandardPage (gallery) ← "Photothèque", "Compilation photos"
│   └── Vidéothèque (.../videotheque)                                StandardPage (embed)  ← vidéos (mp4 / YouTube)
│
├── Documentation  (/documentation · /library)                       LibraryIndexPage      ← "Bibliothèque" (vue agrégée filtrable de tous les LibraryItemPage)
│
└── Contact  (/contact)                                              StandardPage          ← "Contact", "Réseaux sociaux", "Glossaire" (annexe)
```

Pied de page : Mentions légales (`/mentions-legales`), Accessibilité (`/accessibilite`), Plan du site (`/plan-du-site`), Newsletter (intégrée nativement), réseaux sociaux.

### Espaces / parcours différenciés (page d'accueil)

- **Producteur** → Guichet Producteurs (CTA « Demander un appui »).
- **Partenaire technique & financier / bailleur** → Transparence & redevabilité + Espace partenaires (CTA « Télécharger le rapport annuel », « Documents d'accréditation »).
- **Grand public / presse** → Actualités & médias.

## 2. Pourquoi ces regroupements

| Problème relevé dans l'audit | Réponse dans l'arborescence cible |
|---|---|
| 2 menus qui se chevauchent ("Rapports" vs "Bibliothèque") | Tout le documentaire converge vers `Transparence & redevabilité` et `Documentation` (vue filtrable unique). |
| Pas de section Transparence & redevabilité | Rubrique de 1er niveau dédiée. |
| Pas d'espace partenaires distinct | `Projets & partenaires › Partenaires techniques & financiers`. |
| Pas de Suivi & réalisation (KPI) | Rubrique `Suivi & réalisations` (chiffres clés, cartographie). |
| Pas de cartographie | Page `Suivi & réalisations › Cartographie des interventions`. |
| Pas de mécanisme de plaintes | Page `Transparence › Mécanisme de gestion des plaintes` (+ formulaire). |
| Pas d'espace de téléchargement structuré | `LibraryItemPage` typés (rapport d'activités, états financiers, politique…) + filtres. |
| 12 pages EN vides | `wagtail-localize` : chaque page FR a une traduction EN gérée dans l'admin. |
| `?page_id=2470` non SEO-friendly | URLs lisibles `/le-fodecc/notre-histoire` ; redirections 301 des anciennes URLs (Wagtail `contrib.redirects`). |
| Titre HTML pollué par une URL d'image | `seo_title` propre par page + `buildPageMetadata`. |

## 3. Mapping de migration (ancien → nouveau)

| Ancien (fodecc.cm) | Cible | Type cible | Action |
|---|---|---|---|
| Accueil | `/` | `HomePage` | Refonte complète (hero, chiffres clés, parcours, CTA). |
| 136 articles (`Actualité`) | `/actualites/<slug>` | `NewsPage` | Import auto via `scripts/migrate_content.py` (clé `legacy_wp_id`) ; nettoyage HTML ; catégorisation. |
| 4 catégories WP (Actualités, FODECC, Non classé, Rapports) | `NewsCategory` | snippet | Import ; "Non classé" ignoré ; ajouter Guichet Producteurs / Presse / Communiqués / Partenariats. |
| FONDS / Missions / Programmes / Notre histoire / Notre organisation / Qui sommes-nous | `/le-fodecc/*` | `StandardPage` | Réécriture éditoriale + StreamField. |
| 20 pages Gouvernance & organisation | `/le-fodecc/gouvernance/*` | `IndexPage` + `StandardPage` | Regroupement (de ~20 pages à ~5). |
| Mot de l'administrateur (×3) | `/le-fodecc/mot-de-l-administrateur` | `StandardPage` | Fusion en 1 page, version courante. |
| Notre tutelle | `/le-fodecc/gouvernance/tutelle` | `StandardPage` | Migration. |
| Cadre juridique / Textes et lois / Nos codes | `/le-fodecc/cadre-juridique` | `StandardPage` (+ `LibraryItemPage` pour les textes téléchargeables) | Fusion + extraction des PDF. |
| 14 pages Producteurs (guichets, "The Producer's Desk in …") | `/guichet-producteurs/*` | `IndexPage` + `StandardPage` | Regroupement par thème (présentation, demander un appui, en régions, GTAE, dossier de presse). |
| Demande d'appui engrais / plants / Accès aux appuis | `/guichet-producteurs/demander-un-appui` | `StandardPage` + bloc `cta` | Fusion + appel à l'action. |
| Opérateurs filières (SODECAO, IRAD, ONCC, GEX, SUACC, MINFI) | `/projets-partenaires/operateurs` | `StandardPage` | 1 page avec sections (ou snippets `Partner` catégorie `operateur`). |
| Projets MINADER / MINCOMMERCE / MINRESI | `/projets-partenaires/projets` | `StandardPage` | Fusion + articles projets liés. |
| Partenaires | `/projets-partenaires/partenaires-techniques-financiers` | `StandardPage` + snippets `Partner` | Enrichir (FIDA, CAFI, ICCO, UE, KPMG, Banque Mondiale, GCF…). |
| Rapports / Rapports d'activités / Rapports financiers / Comptes administratifs / Compte de gestion (matière) / Etats financiers | `/transparence/*` | `LibraryItemPage` | 1 fiche par document, typée, avec PDF et année. |
| Procédures | `/transparence/politiques` | `LibraryItemPage` | Migration. |
| Plan E&S / PGES, politique anti-fraude | `/transparence/politiques/*` | `LibraryItemPage` | **À produire** (actuellement seulement mentionné en article). |
| (rien) Mécanisme de plaintes | `/transparence/mecanisme-plaintes` | `StandardPage` + formulaire | **Nouveau.** |
| Appels d'offres / Carrière / Offres d'emploi | `/transparence/appels-offres` et `/contact` (carrière) | `LibraryIndexPage` / `StandardPage` | Séparer marchés publics et recrutements. |
| Documents stratégiques (12 pages : plan de relance 2020, réforme filière, libéralisation, ACRAOC, conventions APECCAM…) | `/suivi-realisations/etudes-publications/*` | `LibraryItemPage` | Migration en fiches documents. |
| Bibliothèque | `/documentation` | `LibraryIndexPage` | Vue agrégée filtrable (type, année, thème). |
| Agenda | `/actualites/agenda` | `StandardPage` | Migration. |
| Photothèque / Compilation photos | `/actualites/phototheque` | `StandardPage` (blocs `gallery`) | Fusion. |
| Presse / Presse écrite / Presse audiovisuelle | `/actualites/presse` | catégorie d'actus | Fusion en catégorie + articles. |
| Press book FODECC (PDF ×2) | `/actualites/presse` | `LibraryItemPage` | Migration des PDF. |
| FAQ | `/guichet-producteurs/faq` ou `/le-fodecc/faq` | `StandardPage` (bloc `accordion`) | Migration. |
| Newsletter | intégrée (footer + page) | natif | Remplacer le plugin tiers. |
| Contact / Réseaux sociaux | `/contact` | `StandardPage` + `FooterSettings` | Fusion. |
| Glossaire | `/contact/glossaire` ou annexe | `StandardPage` | Migration (faible priorité). |
| Plan du site | `/plan-du-site` | généré | Auto-généré côté Next. |
| 1659 médias (1642 images, 9 PDF, 8 vidéos) | `wagtailimages` / `wagtaildocs` | – | Import des images utilisées (à la une des articles) automatiquement ; le reste à la demande ; PDF → `LibraryItemPage` ; vidéos → blocs `embed`. |
| 12 pages EN (Home, Missions, Programs, Press, Library, Calendar, Calls for tenders, Careers, Contact, Who we are, Social networks, Newsletter) | traductions EN des pages FR correspondantes | `wagtail-localize` | Créer les traductions ; ne **pas** recréer un arbre EN parallèle. |
| URLs `?page_id=N`, `?p=N` | nouvelles URLs propres | – | Redirections 301 (Wagtail `contrib.redirects` ou règles Nginx) à partir de `legacy_url`. |

## 4. Priorisation suggérée

1. **Lot 1 — fondations** : HomePage, `Le FODECC`, `Guichet Producteurs`, `Actualités` + import des 136 articles, navigation, FR/EN de base. (Va-vite + corrige sécurité/SEO/perf.)
2. **Lot 2 — accréditation** : `Transparence & redevabilité` (rapports, états financiers, politiques, mécanisme de plaintes), `Partenaires techniques & financiers`, `Suivi & réalisations` (chiffres clés). (Débloque l'accès aux financements internationaux.)
3. **Lot 3 — enrichissement** : cartographie des interventions, données ouvertes, photothèque/vidéothèque, FAQ, glossaire, timeline « Notre histoire », newsletter native, redirections 301, accessibilité WCAG, finitions design.
