# Gestion — Matière & Nuance (Cockpit Financier)

Application web (Next.js / React / TypeScript / Tailwind) construite selon
le **Blueprint Technique v1.0** et le cahier des charges **Sprint 1
(Fondation)** fournis par le client. C'est un projet **distinct** des
deux autres présents dans ce dépôt :

- `public/` — le site vitrine PHP (CMS JSON, `/admin`).
- `erp-pilotage/` — le classeur Google Sheets / Apps Script "Pilotage"
  (V1 → V6), qui reste un produit séparé et n'est pas remplacé par ce
  Cockpit.

Ce Cockpit gère uniquement la rentabilité, les charges, les objectifs,
les analyses et les indicateurs financiers — il ne remplace pas Obat
(devis/factures).

## Référence visuelle

La maquette Claude Design fournie (`Matière & Nuance ERP.dc.html`) est
la référence visuelle officielle. Toutes les couleurs, polices,
espacements, ombres et rayons de bordure ont été extraits fidèlement
dans `tailwind.config.ts` (namespace `mn`, `success`/`warning`/`danger`,
`chart.1`..`chart.6`) — aucune valeur n'a été inventée en dehors de
cette échelle. Voir `src/app/globals.css` pour les utilitaires
(`.font-serif-display`, `.tnum`, `.lbl`) copiés à l'identique de la
maquette.

## Décisions prises pour ce Sprint 1 (non spécifiées → choix le plus simple, documenté ici)

- **Emplacement du code** : ce projet vit dans ce dépôt (`gestion-app/`),
  sur la branche `claude/erp-matiere-nuance-1mme8l`, plutôt que dans un
  nouveau dépôt Git séparé — la session de développement est
  contractuellement liée à ce dépôt/branche. Le workflow
  `main`/`develop`/`feature/*` proposé dans le Blueprint peut être mis
  en place ultérieurement en extrayant ce dossier
  (`git subtree split --prefix=gestion-app`) vers un dépôt dédié.
- **Authentification (Sprint 1)** : un seul compte admin, défini par
  variables d'environnement (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), avec une
  session signée (HMAC-SHA256, cookie `httpOnly`). Aucune base
  d'utilisateurs n'est encore définie (le Blueprint prévoit
  PostgreSQL/Supabase pour une V2 du stockage) — **à remplacer** dès
  qu'un vrai système multi-utilisateurs sera spécifié.
- **Chantiers — colonnes calculées** : le client a confirmé que la
  feuille Chantiers réelle correspond déjà au schéma à 11 colonnes
  (Client, Prix vendu HT, Fournitures HT, Sous-traitant HT, Apporteur
  HT, Coût total HT, Marge € HT, Marge %, Jours, €/Jour, % Fournitures)
  et a autorisé l'ajout de formules sur les colonnes calculées. **Ces
  calculs sont implémentés côté application** (`src/services/chantiers.ts`),
  jamais dans Google Sheets — conformément au Blueprint §4 ("tous les
  calculs sont réalisés côté serveur, jamais dans Google Sheets").
  Google Sheets ne sert que de stockage des colonnes saisies.
- **Next.js 15 / React 19** (plutôt que Next 14 initialement prévu) :
  `next@14.2.18` embarquait plusieurs failles de sécurité connues, dont
  une exposant les endpoints de Server Actions sans authentification
  (GHSA-955p-x3mx-jcvp), pertinente ici puisque login/logout sont des
  Server Actions. Cette faille n'est corrigée qu'à partir de
  `next@15.5.21`. `npm audit --omit=dev` ne remonte plus aucune
  vulnérabilité de production sur la version installée (`15.5.22`).
- **Favicon** : `src/app/icon.png` réutilise `logo-carre.png` du site
  vitrine (aucun favicon n'était fourni dans la maquette).
- **Bouton de déconnexion dans le Header** : absent visuellement de la
  maquette, mais explicitement requis par le Blueprint Sprint 1
  ("Informations utilisateur, Bouton Déconnexion"). Ajouté dans la
  continuité stricte du style des boutons-icônes déjà présents dans le
  Header (44×44, `rounded-control`, fond `mn-card`, ombre `shadow-control`)
  — signalé ici comme demandé plutôt qu'appliqué silencieusement.

## Stack

- Next.js 15 (App Router), React 19, TypeScript strict.
- Tailwind CSS 3 — design tokens dans `tailwind.config.ts`.
- Aucune bibliothèque de graphiques : les visualisations (courbe,
  donut, barres) sont du SVG/CSS pur, reproduisant exactement les
  visuels de la maquette (aucune dépendance ajoutée non demandée).

## Structure (architecture orientée fonctionnalités, Blueprint §4/§7)

```
src/
├── app/                    Routes App Router (login, (app)/dashboard, ...)
├── features/                Composition par module métier (dashboard, chantiers, charges, finance, analyses, settings)
├── components/
│   ├── ui/                  Design system réutilisable (Button, Input, KpiCard, Table, Modal, Badge, Toast)
│   └── layout/              Sidebar, Header, icônes de navigation
├── lib/                     session, format, charts, nav, cn, env, user
├── services/                Moteur de calcul (ex. chantiers.ts) — jamais dans Google Sheets
└── types/                    Types partagés
```

## Démarrage local

```bash
cd gestion-app
npm install
cp .env.example .env.local   # puis renseigner ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET
npm run dev
```

`npm run build` et `npm run lint` passent sans avertissement (vérifié).

## Vérifications effectuées ce sprint

- `npm run build` : compilation propre, 0 avertissement.
- `npm run lint` : 0 avertissement, 0 erreur.
- `npm audit --omit=dev` : 0 vulnérabilité.
- Test de bout en bout en navigateur réel (Playwright + Chromium) :
  connexion → les 6 pages protégées s'affichent (bon H1/sous-titre
  chacune) → déconnexion → route protégée redemande bien la connexion.
  Aucune erreur console.
- Capture d'écran des 6 pages + login comparées visuellement à la
  maquette : fidélité confirmée (voir décisions ci-dessus pour les
  seuls écarts assumés).

## Ce qui n'est PAS fait dans ce Sprint 1 (attendu, cf. cahier des charges)

- Aucune connexion réelle à Google Sheets (toutes les données des 6
  pages sont des exemples statiques, clairement indiqués comme
  placeholder dans chaque fichier `features/*/data.ts`).
- Paramètres (Objectifs, Hypothèses, Affichage) sont affichés mais pas
  encore éditables/persistés.
- Le sélecteur de dates du Header est présentationnel (pas de logique
  de filtrage réelle).
- Pas de gestion multi-utilisateurs (cf. décision Authentification
  ci-dessus).

Tout ceci est le contenu attendu du Sprint 2 (branchement Google
Sheets, moteur de calcul complet, persistance des paramètres).
