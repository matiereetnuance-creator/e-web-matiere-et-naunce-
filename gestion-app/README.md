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
- Aucune bibliothèque de graphiques ni d'animation : les visualisations
  (courbe, donut, barres) sont du SVG/CSS pur via `src/components/charts/`,
  et les animations sont des transitions/keyframes CSS natives — aucune
  dépendance ajoutée non demandée.

## Structure (architecture orientée fonctionnalités, Blueprint §4/§7)

```
src/
├── app/                    Routes App Router (login, (app)/dashboard, ...)
├── features/                Composition par module métier (dashboard, chantiers, charges, finance, analyses, settings)
├── components/
│   ├── ui/                  Design system réutilisable (Button, Input, KpiCard, Table, Modal, Badge, Toast)
│   ├── charts/               ChartCard, LineChart, BarChart, DonutChart, PeriodChip — un seul jeu de composants pour tous les graphiques
│   └── layout/              Sidebar, Header, PageTransition, icônes de navigation
├── lib/                     session, format, charts (palette + conic-gradient), nav, cn, env, user
├── services/                Moteur de calcul (ex. chantiers.ts) — jamais dans Google Sheets
└── types/                    Types partagés
```

## Système de graphiques (préparation avant Sprint 2)

Les graphiques ad hoc de Dashboard/Charges/Analyses ont été extraits en
4 composants réutilisables dans `src/components/charts/` :

- `ChartCard` — carte hôte commune (titre, action, légende textuelle).
- `LineChart` — courbes pilotées par des valeurs (pas de tracé SVG en
  dur) : plusieurs séries, callout, axe des Y, légende.
- `BarChart` — barres verticales, série unique à couleur par barre
  (Charges) ou séries groupées avec légende (Analyses).
- `DonutChart` — anneau conique + centre optionnel + légende optionnelle.
- `PeriodChip` — le bouton "Cette année" répété sur plusieurs cartes.

**Écart assumé et documenté** : la ligne "Objectif annuel" du graphique
Dashboard (auparavant un tracé décoratif dessiné à la main) est
désormais une vraie série de données (rythme linéaire pour atteindre
l'objectif annuel), cohérente avec le nouveau modèle "tout est piloté
par des valeurs". L'angle visuel de cette ligne diffère donc légèrement
de la maquette d'origine — le style (couleur, pointillés) reste
identique. Vérifié par capture d'écran : aucune autre différence
visuelle sur les 3 pages refactorées.

## Animations (préparation avant Sprint 2)

Très sobres, cohérentes sur tout le logiciel, respectent
`prefers-reduced-motion` :

- **Apparition douce** : `.animate-fade-up` (globals.css) sur le
  contenu de chaque page ; `.stagger-children` (léger décalage de 45ms)
  uniquement sur les grilles de cartes KPI (Dashboard, Santé
  financière, Paramètres) — pas sur les cartes de graphiques, pour
  éviter une animation trop chargée.
- **Transition de page** : `PageTransition` (`components/layout`)
  reclenche le fade à chaque navigation (clé React = chemin de la
  route).
- **Survol cohérent** : une seule classe `.card-hover` (ombre plus
  marquée) appliquée à toutes les cartes (KPI, graphiques, tableaux) ;
  boutons secondaires et lignes de tableau ont un fond au survol
  cohérent avec le composant `Button`.

Aucune bibliothèque d'animation ajoutée (Framer Motion, etc.) —
transitions CSS natives, conformément à "simplicité avant complexité".

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

**Non-critique, signalé plutôt que corrigé silencieusement** : quelques
boutons secondaires ("Filtrer" sur Chantiers, "Voir tous" sur
Dashboard) restent écrits en JSX brut avec des classes dupliquant le
style du composant `Button` (variante secondaire), plutôt que d'utiliser
`<Button variant="secondary">` directement. Le survol est cohérent
partout (corrigé dans cette passe), mais l'unification complète de ces
boutons vers le composant partagé n'a pas été faite — petit nettoyage
possible dans une prochaine passe.

## Sprint 2 — CRUD complet des Chantiers

Création, modification, suppression (avec confirmation), colonnes
dérivées toujours calculées automatiquement — jamais saisies. Le
tableau Chantiers (11 colonnes validées au Sprint 1) n'a pas changé de
structure.

- **Drawer** (`components/ui/Drawer.tsx`) — nouveau composant
  réutilisable : panneau latéral droit, 560px, pleine hauteur, fond
  blanc, sans arrondi (aucun autre composant du Design System n'utilise
  de coin arrondi d'un seul côté), fermeture par croix ou Échap. Réservé
  à Créer/Modifier ; `Modal` reste réservée aux confirmations
  (suppression).
- **Actions discrètes** : pas de colonne "Actions" permanente. Un
  menu **⋯** par ligne, invisible au repos, révélé au survol de la
  ligne (ou au focus clavier) — "Modifier" / "Supprimer".
- **`nomChantier`** : nouveau champ métier confirmé par le client,
  saisi dans le drawer et stocké dans le modèle, **volontairement
  absent du tableau** pour cette V1 (usage prévu : recherche/évolutions
  futures). Les 8 chantiers d'exemple existants ont été initialisés
  avec `nomChantier = client` (donnée historique, pas de vraie valeur
  distincte disponible).
- **Repository en mémoire** (`services/chantiers-repository.ts`) :
  `listChantiers`/`getChantier`/`createChantier`/`updateChantier`/`deleteChantier`.
  Le moteur de calcul (`services/chantiers.ts`) n'a pas été touché, à
  une exception près : `computeChantiersTotals()` construit une ligne
  "Total" synthétique qui doit maintenant fournir `id`/`nomChantier`
  pour respecter le type — deux constantes ajoutées (`'total'`/`'Total'`),
  **aucun calcul modifié**.
- **Bug réel trouvé et corrigé pendant ce sprint** : un stockage en
  mémoire via une simple variable de module (`let chantiers = [...]`)
  ne fonctionne pas de façon fiable avec les Server Actions Next.js en
  production — confirmé par test réel (une création était invisible
  après rafraîchissement, alors que l'action elle-même la voyait). Next.js
  peut regrouper Server Actions et Server Components dans des graphes de
  modules distincts, chacun avec sa propre instance de `let`. Corrigé en
  stockant l'état sur `globalThis` (singleton réellement partagé pour tout
  le process Node) — solution standard pour ce problème connu, toujours
  "en mémoire", aucune dépendance ajoutée.

### Ce qui n'a volontairement pas été modifié
- `services/chantiers.ts` (moteur de calcul) — sauf les 2 constantes
  ci-dessus.
- Le Design System, la charte graphique, les composants existants.
- La structure du tableau Chantiers (toujours 11 colonnes).
- Le bouton "Filtrer" (inchangé, toujours non fonctionnel).

### Limites connues
- **Persistance non durable** : les données créées/modifiées vivent en
  RAM du process serveur — perdues au redémarrage, partagées
  globalement (pas de séparation par utilisateur, cohérent avec
  l'authentification à un seul compte du Sprint 1).
- **Validation manuelle** (champs requis, nombres ≥ 0), pas de
  bibliothèque de schéma — suffisant pour ce sprint, mais moins robuste
  qu'une validation par schéma si les règles se complexifient.
- `nomChantier` n'est ni recherchable ni filtrable pour l'instant
  (stocké mais pas exploité ailleurs que dans le drawer).

### Impact sur les prochains sprints
- Le repository (`chantiers-repository.ts`) isole déjà l'accès aux
  données derrière des fonctions simples : le sprint de connexion à
  Google Sheets devra remplacer son implémentation interne, pas les
  Server Actions ni l'UI.
- Le contournement `globalThis` reste une solution "mémoire unique
  process" : elle ne résout pas la cohérence entre plusieurs instances
  serveur (déploiement multi-instance/serverless). C'est un argument de
  plus pour brancher un vrai stockage (Google Sheets ou base de
  données) dès que possible.
- Si `nomChantier` doit un jour apparaître dans le tableau ou servir de
  critère de recherche, la colonne pourra être ajoutée sans reprendre le
  drawer (déjà en place).

## Sprint 3 — CRUD complet des Charges

Même principe que le Sprint 2 (Chantiers) : création, modification,
suppression (avec confirmation), Montant HT / TVA calculés
automatiquement à partir du Montant TTC saisi et du Taux de TVA —
jamais saisis directement.

- **Constat avant développement** : contrairement à Chantiers, la page
  Charges (Sprint 1) n'affichait que des vues agrégées (donut par
  catégorie, barres mensuelles, tableau de synthèse) — aucune charge
  individuelle n'existait comme enregistrement. Le CRUD demandé
  implique donc l'ajout d'une **vraie liste de charges** avec totaux,
  en plus des graphiques existants. **Les 3 vues agrégées du Sprint 1
  n'ont pas été touchées** (toujours leurs propres données d'exemple,
  non reliées à la nouvelle liste) — les relier aurait été une
  fonctionnalité non demandée.
- **Catégories existantes** : les 6 déjà utilisées sur cette même page
  (Fournitures, Véhicules, Charges fixes, Sous-traitance, Assurances,
  Autres) — `types/charge.ts`, aucune catégorie inventée.
- **Nouveau composant `Select`** (`components/ui/Select.tsx`) : aucun
  composant de liste déroulante n'existait dans le Design System ;
  nécessaire pour Catégorie/Taux de TVA/Périodicité. Copie exacte du
  style visuel d'`Input` (mêmes tokens), pas une réinterprétation.
- **Périodicité/Actif conservés** tels que confirmés précédemment
  (Mensuelle/Trimestrielle/Annuelle/Ponctuelle ; bascule Actif reprenant
  le style déjà utilisé sur Paramètres ▸ Affichage, rendue interactive).
- **Repository en mémoire** (`services/charges-repository.ts`), même
  architecture que Chantiers (`globalThis` dès le départ, pas de
  redécouverte du bug du Sprint 2).
- **Menu ⋯ dupliqué localement** dans `ChargesInteractive.tsx` (comme
  dans `ChantiersInteractive.tsx`) plutôt que factorisé en composant
  partagé — pour ne pas refactoriser le code existant de Chantiers.

### Ce qui n'a volontairement pas été modifié
- Les 3 graphiques/tableaux agrégés existants de Charges (donut,
  barres, synthèse par catégorie) et leurs données.
- `ChantiersInteractive.tsx` / `ChantierForm.tsx` (aucune factorisation
  du menu ⋯ vers eux).
- Le Design System, la charte graphique, `Drawer`/`Modal`/`Table`/`Badge`.

### Limites connues
- Mêmes limites que Chantiers : persistance en RAM serveur, validation
  manuelle sans bibliothèque de schéma.
- Les 3 vues agrégées de Charges restent des exemples statiques,
  déconnectés de la nouvelle liste individuelle — les chiffres affichés
  ne se recoupent pas nécessairement (non demandé pour ce sprint).
- Pas de tri ni de filtre sur la liste des charges (non demandé).

### Impact sur les prochains sprints
- Si un futur sprint doit rendre les graphiques agrégés réellement
  dérivés des charges individuelles, `services/charges.ts` fournit déjà
  `computeChargesTotals()` — une base de calcul à étendre (répartition
  par catégorie, évolution mensuelle), sans dépendance nouvelle.
- Même repository/pattern que Chantiers : le sprint Google Sheets
  pourra traiter les deux modules de façon symétrique.

## Sprint 4 — Dashboard dynamique

Objectif : remplacer les données fictives du Dashboard par les données
réelles des modules Chantiers/Charges, sans aucune modification visuelle
(Design System, cartes, graphiques, mise en page inchangés).

- **Source unique de vérité** : `services/dashboard.ts` (nouveau). Toute
  la logique de calcul/regroupement du Dashboard y est centralisée ;
  `DashboardView.tsx` ne fait plus que lire les repositories et afficher
  ce que `computeDashboardData()` renvoie — aucune logique métier dans
  la vue. Ce moteur ne fait que composer les sorties déjà calculées par
  `chantiers.ts`/`charges.ts` (`computeChantiersTotals`, `margeNiveau`),
  jamais de nouvelle formule financière.
- **Chiffre d'affaires réalisé** = `computeChantiersTotals().prixVenduHT`.
- **Marge moyenne** = `computeChantiersTotals().margePct`.
- **Résultat prévisionnel** : **reste sur la valeur d'exemple Sprint 1**
  (`146 850 €` / `24,1 %`), à la demande explicite du client — aucune
  formule n'a été validée pour ce KPI. À reprendre dès qu'une formule
  métier sera définie (voir `RESULTAT_PREVISIONNEL_PLACEHOLDER` dans
  `services/dashboard.ts`).
- **Charges du mois** = somme du Montant HT des charges **actives**
  dont la date tombe dans le mois civil en cours. Lecture littérale du
  champ `date` existant : aucune projection des charges récurrentes
  (Mensuelle/Trimestrielle/Annuelle) sur les mois futurs n'est faite.
  **Avec les données de départ (toutes datées 2024), ce KPI affichera
  0 € tant qu'aucune charge n'est saisie avec une date dans le mois
  réel en cours** — comportement attendu, pas un bug.
- **Répartition des charges** (donut) = regroupement des charges
  actives par catégorie, pourcentage du Montant HT total.
- **Chantiers les plus rentables** = les 5 chantiers triés par
  `margePct` décroissant. Colonne **Type** : affichée `—` (aucun champ
  correspondant dans `ChantierInput` — pas de valeur inventée, à la
  demande du client).
- **Points d'attention** : réutilise `margeNiveau()` (seuils déjà
  validés au Sprint 1) pour lister les chantiers en marge faible
  (< 40 %) au lieu des exemples fictifs précédents. Affiche un état
  "Aucun point d'attention" si aucun chantier n'est concerné (pour ne
  pas laisser la carte vide).
- **Évolution du chiffre d'affaires** : le graphique (`ChartCard`) est
  conservé, mais **n'affiche plus aucune donnée fictive**. Les
  chantiers n'ayant pas de champ date, une répartition mensuelle réelle
  est impossible à calculer ; la carte affiche un état vide explicite
  ("Données indisponibles : les chantiers ne renseignent pas encore de
  date…"). Ajouter un champ date serait un changement de schéma —
  cf. règle du projet sur les changements de structure de contenu, à
  signaler explicitement au client avant toute livraison.
- **`features/dashboard/data.ts` supprimé** : entièrement remplacé par
  des données réelles ou par l'état vide explicite ci-dessus ; plus
  aucun import ne le référençait.
- **Badges "vs N-1"** : aucune donnée historique n'existe dans les
  repositories (ni Chantiers ni Charges ne conservent de notion
  d'exercice précédent) — les 4 badges restent fixés sur leurs valeurs
  d'exemple Sprint 1, en attendant qu'un historique réel soit possible.

### Ce qui n'a volontairement pas été modifié
- Le Design System, les composants UI, les espacements, les couleurs,
  les cartes, le responsive, la navigation.
- `services/chantiers.ts` et `services/charges.ts` (moteurs de calcul
  Sprint 2/3, inchangés — `dashboard.ts` les appelle, ne les duplique
  pas).
- Aucun nouveau KPI, aucun nouveau graphique.

### Limites connues
- "Résultat prévisionnel" reste un placeholder tant que sa formule
  n'est pas définie avec le client.
- "Charges du mois" affichera 0 € avec les données de départ (dates en
  2024) jusqu'à saisie d'une charge datée du mois réel en cours.
- "Évolution du chiffre d'affaires" reste indisponible tant qu'aucun
  champ date n'existe sur les chantiers (changement de schéma hors
  périmètre de ce sprint).
- Colonne "Type" des chantiers les plus rentables toujours affichée
  `—` (champ inexistant).

### Impact sur les prochains sprints
- Si un futur sprint ajoute un champ date aux chantiers (avec l'accord
  explicite du client, cf. règle de changement de schéma), le graphique
  "Évolution du chiffre d'affaires" pourra être rebranché sur des
  données réelles dans `services/dashboard.ts` sans toucher à
  `DashboardView.tsx`.
- Dès qu'une formule "Résultat prévisionnel" sera validée, un seul
  endroit à modifier : `services/dashboard.ts`.

## Sprint 5 — Paramètres gérables

Objectif : rendre les 6 informations déjà affichées sur la page Paramètres
réellement modifiables et persistées, sans changer le périmètre (aucun
nouveau paramètre) ni toucher aux autres modules.

- **Vue de consultation + Drawer** (choix validé avec le client) : la
  page reste un écran de lecture ; un bouton "Modifier" ouvre un Drawer
  contenant les 6 champs (Objectif annuel de CA, Taux de marge cible,
  Charges fixes mensuelles, Part fournitures de référence, Arrondir les
  montants, Comparaison N-1) — même architecture Drawer + Server Action
  que Chantiers/Charges.
- **`services/settings-repository.ts`** (nouveau) : fiche unique
  (pas de liste), stockage `globalThis` — même pattern que
  `chantiers-repository.ts`/`charges-repository.ts`. Pas de fichier de
  calcul dédié (`services/settings.ts`) : contrairement à Chantiers/
  Charges, aucun champ n'est dérivé ici, il n'y a donc rien à calculer.
- **`features/settings/actions.ts`** : `updateSettingsAction` + validation
  manuelle (montants positifs, pourcentages entre 0 et 100), même
  convention que `parseChargeForm`/`parseChantierForm`.
- **`features/settings/SettingsForm.tsx`** : Drawer réutilisant
  `Input` et le pattern d'interrupteur déjà utilisé pour "Charge active"
  (Sprint 3), dupliqué localement (pas de nouveau composant partagé,
  comme convenu).
- **`features/settings/SettingsInteractive.tsx`** (nouveau) : Client
  Component séparant l'affichage (identique à l'existant) de
  l'ouverture du Drawer — même séparation Server/Client que
  `ChantiersView`/`ChantiersInteractive`.
- **`features/settings/data.ts` supprimé** : entièrement remplacé par
  les données réelles du repository.
- Les pourcentages sont stockés sur une échelle 0-100 (comme
  `DonutSegment.pct`), pas en ratio 0-1, pour rester cohérent avec le
  reste du codebase et éviter une conversion superflue.

### Ce qui n'a volontairement pas été modifié
- Dashboard, Chantiers, Charges, Design System, Layout, navigation,
  authentification — aucun de ces fichiers n'a été touché.
- Aucun nouveau paramètre, aucune nouvelle fonctionnalité au-delà de la
  persistance des 6 champs déjà affichés.

### Limites connues
- Les préférences "Arrondir les montants" et "Comparaison N-1" sont
  réellement enregistrées, mais ne modifient encore aucun autre écran
  (les brancher sur Dashboard/Charges/Chantiers est hors périmètre de
  ce sprint — cela toucherait des modules explicitement protégés).
- Limitation déjà connue et confirmée pré-existante (pas une régression
  de ce sprint) : en dessous de la largeur desktop, la Sidebar ne se
  réduit pas et les grilles/tableaux débordent — identique sur
  Charges/Chantiers, non spécifique à Paramètres.
- Persistance en mémoire serveur (perdue au redémarrage), comme tous
  les autres modules.

### Impact sur les prochains sprints
- Si un futur sprint doit faire agir "Arrondir les montants"/
  "Comparaison N-1" sur d'autres écrans, `services/settings-repository.ts`
  expose déjà `getSettings()` — à appeler depuis les vues concernées.
