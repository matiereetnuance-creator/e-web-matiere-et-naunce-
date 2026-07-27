# ERP Matière & Nuance — Google Sheets / Apps Script

ERP interne (pilotage de l'activité, hors site web public) développé en
Google Apps Script : le code de ce dossier construit intégralement la
structure, la mise en forme, les formules, les validations et les
protections d'un classeur Google Sheets, sans base de données externe.

Ce module est indépendant du site web (`public/`) présent dans le
reste de ce dépôt — même client, outil différent (pilotage interne).

## Architecture — Chantiers/Charges-first (V5)

Cahier des charges client V5 : **Chantiers et Charges sont les SEULS
tableaux de saisie du classeur**, et alimentent automatiquement tout
le reste (Dashboard, Prévisionnel, Analyse, tous les indicateurs) sans
aucune double saisie — c'était déjà l'architecture du projet depuis la
V1 (formules `monthlyAmountFormula_`/`annualAmountFormula_`/
`chargesEquivalentMensuelFormula_`, `01_Utils.gs`/`20_Charges.gs`), la
V5 le formalise en règle explicite. **Toutes les autres feuilles
(Accueil, Dashboard, Prévisionnel, Analyse) sont des vues de pilotage
pures : aucune saisie n'y est jamais possible**, chaque cellule non
vide y est une formule protégée.

7 feuilles, dans cet ordre :

1. `01 - Accueil` — titre, exercice, bouton vers le Dashboard (vue pure)
2. `02 - Dashboard` — 5 KPI + 2 graphiques (vue pure)
3. `03 - Chantiers` — **existe déjà chez le client ; contenu, en-têtes,
   colonnes et logique jamais modifiés — seule sa présentation peut
   l'être depuis la V5, voir plus bas**
4. `04 - Charges` — base des charges fixes (saisie) + 2 cartes KPI
5. `05 - Paramètres` — réglages de l'exercice + listes déroulantes (saisie)
6. `06 - Prévisionnel` — vue mensuelle Objectif / Réalisé / Ecart (vue pure)
7. `07 - Analyse` — 3 graphiques (CA, Marge, Charges par catégorie) (vue pure)

```
erp-pilotage/
├── appsscript.json          Manifeste du projet Apps Script
├── ARCHITECTURE.md          Plages nommées, dépendances, flux de données, erreurs, performance, design
├── CHANGELOG.md             Historique détaillé V1 / V2 / V3 / V4
├── ROADMAP.md               Évolutions possibles (non développées)
├── TODO.md                  Actions restantes avant mise en production
├── KNOWN_LIMITATIONS.md     Limites Google Sheets et risques acceptés
└── src/
    ├── VERSION.gs            Numéro de version, date de build, auteur — source unique
    ├── 00_Constantes.gs      Source unique de vérité (noms, couleurs, système de design grand écran V5, mapping Chantiers)
    ├── 01_Utils.gs           Fonctions réutilisables (cartes KPI, protections, formules, style des graphiques)
    ├── 02_Menu.gs            Menu "Pilotage"
    ├── 03_Erreurs.gs         Bibliothèque de gestion des erreurs (V3)
    ├── 04_Protections.gs     Filet de sécurité générique sur les cellules à formule (V3)
    ├── 05_Accueil.gs
    ├── 06_Journal.gs         Journal technique interne, Document Properties (V4)
    ├── 07_APropos.gs         Menu Pilotage ▸ À propos (V4)
    ├── 10_Parametres.gs
    ├── 20_Charges.gs
    ├── 30_Chantiers.gs       Lecture par en-tête + harmonisation visuelle (V5) ; contenu/en-têtes/colonnes jamais écrits
    ├── 40_Dashboard.gs
    ├── 50_Previsionnel.gs
    ├── 60_Analyse.gs
    ├── 85_NouvelExercice.gs  Assistant "Nouvel exercice" (nouveau fichier par année)
    ├── 90_Diagnostic.gs      Menu Pilotage ▸ Diagnostic (V3)
    ├── 95_Export.gs          Menu Pilotage ▸ Exporter un rapport PDF (V4)
    └── 99_Installation.gs    Orchestration de l'installation complète
```

Pour le détail des plages nommées, du graphe de dépendances entre
feuilles, de l'ordre d'installation, de la gestion des erreurs et des
optimisations de performance, voir **[`ARCHITECTURE.md`](ARCHITECTURE.md)**.

## ⚠️ Point d'attention avant mise en production : la feuille Chantiers

Le tableau `03 - Chantiers` existe déjà dans le classeur du client et
**sa structure ne doit jamais être modifiée** (aucune colonne ajoutée,
supprimée ou renommée par ce projet). Les autres onglets lisent ses
données par **nom d'en-tête**, pas par position de colonne — et,
depuis la V2, ces en-têtes attendus sont **saisis par le client
lui-même dans `05 - Paramètres`** (section "Connexion à l'onglet
Chantiers", cellules B12 à B15) plutôt que codés en dur dans le
script :

| Cellule Paramètres | Champ | Valeur par défaut (1ʳᵉ installation) |
|---|---|---|
| B12 | Colonne « CA HT » | `CA HT` |
| B13 | Colonne « Marge HT » | `Marge HT` |
| B14 | Colonne « Date » | `Date de facturation` |
| B15 | Colonne « Statut » | `Statut` |

Ces valeurs par défaut (`CHANTIERS_FIELDS` dans `00_Constantes.gs`) ne
servent qu'à pré-remplir les cellules lors de la toute première
installation ; ensuite, seule la cellule Paramètres fait foi et n'est
plus jamais réécrite. **Avant toute mise en production**, corrigez ces
4 cellules pour qu'elles correspondent aux véritables en-têtes de la
feuille Chantiers du client — un seul endroit à modifier, sans toucher
au code, tout le reste du classeur se reconnecte automatiquement.
Le menu **Pilotage ▸ Vérifier la structure Chantiers** contrôle cette
correspondance et signale toute colonne introuvable.

`CHANTIERS_STATUT` est relié mais volontairement **non utilisé comme
filtre** dans les formules de CA/marge tant que les valeurs réelles de
ce statut (ex. "Facturé", "Terminé"…) n'ont pas été confirmées avec le
client — un mauvais filtre fausserait silencieusement tous les
indicateurs. Le paramètre `extraCondition` de `monthlyAmountFormula_()`
/ `annualAmountFormula_()` (`01_Utils.gs`) est prêt à l'emploi pour le
brancher dès que nécessaire.

### Harmonisation visuelle de Chantiers (V5, nouveau)

Le cahier des charges V5 autorise explicitement des améliorations
**strictement visuelles** sur Chantiers (couleurs d'en-tête, gel de la
ligne d'en-tête, largeurs de colonnes, vue filtrée) — jamais de
contenu, d'en-tête, de colonne ni de logique touchés, et jamais son
état de protection existant modifié. `harmoniserChantiers_()`
(`30_Chantiers.gs`) s'exécute automatiquement lors de l'Étape 1/3 de
l'installation. Voir `ARCHITECTURE.md` §20 pour le détail technique et
`TODO.md` pour la vérification recommandée avant mise en production
(tester sur une copie du classeur avant le fichier réel).

## Déploiement

### Option A — clasp (recommandé)

```bash
npm install -g @google/clasp
clasp login
cd erp-pilotage
clasp create --type sheets --title "Matière & Nuance — Pilotage"
clasp push
```

`clasp create --type sheets` crée un classeur Google Sheets lié et un
projet Apps Script. Après le premier `clasp push`, ouvrez le classeur
généré : le menu **Pilotage** apparaît au rechargement de la page
(`onOpen`). Utilisez **Pilotage ▸ 🛠️ Installation (en 3 étapes)** pour
construire l'ensemble des feuilles, une étape à la fois (voir
"Première installation" ci-dessous).

Pour connecter ce code à un classeur **déjà existant** chez le client
(celui qui contient la vraie feuille Chantiers) : `clasp clone
<scriptId>` (ou liez le script existant via Extensions ▸ Apps Script
dans Sheets, puis copiez les fichiers de `src/` dans l'éditeur), puis
`clasp push`.

### Option B — copier-coller manuel

1. Dans le classeur Google Sheets cible : *Extensions ▸ Apps Script*.
2. Créez un fichier `.gs` par fichier de `src/` (même nom), collez le
   contenu.
3. Copiez le contenu de `appsscript.json` dans le manifeste du projet
   (icône ⚙️ *Paramètres du projet ▸ Afficher le fichier manifeste
   "appsscript.json"*).
4. Enregistrez, rechargez le classeur : le menu **Pilotage** apparaît.

### Première installation

Depuis la V4.1, l'installation est **découpée en 3 étapes** (menu
**Pilotage ▸ 🛠️ Installation (en 3 étapes)**) plutôt qu'un seul clic :
Google Apps Script limite une exécution à 6 minutes sur un compte
gratuit, et tout construire en un seul appel peut dépasser cette
limite lors d'une toute première installation sur un classeur vierge
(constaté en conditions réelles — voir CHANGELOG.md). Chaque étape est
une exécution indépendante, avec son propre budget de temps :

1. **1️⃣ Étape 1/3 — Paramètres + Charges** (relie aussi Chantiers par
   en-tête, puis harmonise visuellement Charges et Chantiers — V5).
2. **2️⃣ Étape 2/3 — Dashboard + Prévisionnel + Analyse.**
3. **3️⃣ Étape 3/3 — Finalisation** (Accueil, protections, rangement
   des onglets).

**Vue filtrée (V5, optionnel)** : pour que Charges/Chantiers obtiennent
une vraie vue filtrée personnelle (plutôt qu'un filtre classique
partagé), activez une fois le service avancé "Google Sheets API" dans
l'éditeur Apps Script (icône `+` à côté de "Services"). Sans cette
étape, l'installation fonctionne quand même : elle utilise
automatiquement un filtre classique à la place (voir
`KNOWN_LIMITATIONS.md`).

Une confirmation est demandée avant chaque étape, et une boîte de
dialogue en fin d'étape indique la suite. Lancer une étape avant la
précédente affiche un message clair sans rien reconstruire. Les
données déjà saisies (lignes de `Charges`, contenu de `Chantiers`,
réglages de `Paramètres`) ne sont jamais effacées, à aucune étape —
seules la mise en forme, les formules, les validations et les
protections sont reconstruites. Voir `RECETTE.md` §2 pour le
déroulé détaillé et `ARCHITECTURE.md` §4 pour le détail technique.

## Choix techniques notables

- **Police** : `Roboto` — `Google Sans` (V1) n'existe pas dans le
  sélecteur de polices de Google Sheets (c'est une police d'interface
  produit Google, pas une police de document disponible via
  `setFontFamily()`) ; Roboto est la police Google réellement
  disponible dans Sheets la plus proche visuellement.
- **Couleur d'accent** : le doré `#c8b394` (`--gold` du site public),
  **confirmé par le client comme couleur d'accent définitive** — ce
  n'est plus une valeur d'attente.
- **Taille des graphiques** : calculée à l'installation à partir de la
  géométrie réelle de leur ancrage (somme des largeurs de colonnes et
  hauteurs de lignes couvertes, `computeChartSize_()` dans
  `01_Utils.gs`) plutôt qu'un pixel fixe codé en dur. Limite propre à
  Google Sheets : un graphique reste un objet de taille fixe une fois
  posé (pas de redimensionnement fluide façon page web) — il se
  réadapte à chaque réinstallation, pas en continu à l'écran.
- **Plage de saisie Charges** étendue à 1000 lignes (`CHARGES_LAST_DATA_ROW`).
- **Mapping Chantiers configurable sans toucher au code** : voir la
  section dédiée ci-dessus et `ARCHITECTURE.md` §18.
- **Catégories de charges** : liste définitive validée par le client —
  Véhicules, Assurances, Administration, Logiciels, Personnel, Autres
  (`PARAM_LISTES.CATEGORIES` dans `00_Constantes.gs`).
- **Cellules calculées protégées** en mode "avertissement" (l'édition
  reste possible en cas de besoin réel, mais un message prévient
  qu'il s'agit d'une cellule calculée) plutôt qu'un verrouillage dur
  nécessitant une gestion de droits — plus simple pour un dirigeant
  seul utilisateur du classeur.
- **Listes déroulantes** toutes générées depuis des plages nommées
  définies dans `05 - Paramètres` (colonnes techniques masquées) :
  aucune valeur de liste n'est écrite en dur dans une formule.
- **Objectif mensuel du Prévisionnel** = Objectif CA HT annuel réparti
  à parts égales sur 12 mois (aucune saisonnalité demandée dans le
  cahier des charges — solution la plus simple et la plus robuste).
- **Prévision de fin d'année** (Dashboard) = CA réalisé ÷ fraction de
  l'exercice écoulée (projection linéaire simple).
- **Réutilisation entre onglets** : la répartition des charges par
  catégorie est calculée une seule fois (table cachée sur Dashboard)
  et réutilisée telle quelle pour le graphique "Charges par catégorie"
  de Analyse, afin d'éviter de dupliquer le même calcul.

## Nouvel exercice (menu Pilotage ▸ 🆕 Nouvel exercice…)

Le modèle retenu est **un fichier Google Sheets par exercice**. Le menu
**Pilotage ▸ Nouvel exercice…** (`85_NouvelExercice.gs`) :

1. Ne modifie **jamais** le fichier actuel.
2. Crée une copie complète du classeur (`Spreadsheet.copy()` — qui
   duplique déjà tout : feuilles, formules, plages nommées, graphiques,
   protections) pour l'exercice suivant.
3. Dans cette copie uniquement, ajuste ce qui doit changer d'une année
   sur l'autre :
   - `Exercice`, `Date début`, `Date fin` → avancés à l'année suivante ;
   - `Objectif CA HT` → remis à zéro (à ressaisir) ;
   - `Objectif Marge`, `Salaire mensuel souhaité`, mapping Chantiers
     (B12:B15) → **conservés tels quels** ;
   - `Chantiers` → lignes de données vidées (nouvelle liste de
     chantiers pour la nouvelle année), en-tête et mise en forme
     intacts ;
   - `Charges` → **conservées telles quelles** (charges fixes
     récurrentes, aucune raison de les vider en début d'année).

Rien d'autre n'est reconstruit : Dashboard, Prévisionnel et Analyse ne
contiennent que des formules pointant vers des plages nommées propres
à chaque fichier — copiées avec lui, elles se recalculent
automatiquement sur le nouvel exercice et un Chantiers vide, sans
qu'aucun `build*_()` n'ait besoin de retourner sur la copie.

## Menu Pilotage

| Entrée | Rôle |
|---|---|
| 🏠 Accueil / 📊 Dashboard | Navigation rapide |
| 📄 Exporter un rapport PDF… | Génère un PDF A4 (Dashboard, Prévisionnel, Analyse) déposé sur Drive (V4) |
| 🔄 Actualiser les listes déroulantes | Ré-applique les validations de Charges sans tout reconstruire |
| ✅ Vérifier la structure Chantiers | Contrôle le mapping B12:B15 contre la vraie feuille Chantiers |
| 🔒 Réappliquer les protections | Ré-arme le filet de sécurité (V3) sans reconstruire les feuilles |
| 🩺 Diagnostic | 8 contrôles automatiques, rapport clair (V3, harmonisation visuelle ajoutée en V5) |
| 🗒️ Afficher le journal | Les 20 derniers événements techniques enregistrés (V4) |
| 🆕 Nouvel exercice… | Crée une copie du classeur pour l'année suivante (voir section dédiée) |
| 🛠️ Installation (en 3 étapes) | (Re)construit tout le classeur en 3 clics séparés, sans jamais effacer les données saisies (V4.1 — voir "Première installation") |
| ℹ️ À propos… | Nom, version, build, auteur, dernier diagnostic, dernière installation (V4) |

## Robustesse (V3)

Toutes les formules générées par le script sont protégées contre les
erreurs de calcul (`#REF!`, `#N/A`, `#VALUE!`, `#NOM?`) : une
dépendance cassée retombe sur une valeur neutre (0, ou un tiret)
plutôt que d'afficher une erreur, et le vrai diagnostic se fait via le
menu Diagnostic — jamais en lisant un symbole d'erreur au milieu du
classeur. Le détail (bibliothèque d'erreurs, validations de saisie,
mise en forme conditionnelle sobre, protections) est documenté dans
`ARCHITECTURE.md` §9 à §13.

## Design System (V6)

Objectif : que le classeur donne l'impression d'une application
professionnelle haut de gamme conçue pour Matière & Nuance, pas d'un
tableur amélioré — élégant, minimaliste, très lisible, jamais
surchargé. Direction artistique élargie en V6 au-delà des seuls
logiciels de gestion : Apple, Arc Browser, Raycast, Linear, Stripe
Dashboard, Figma (principes — simplicité, cohérence, espace,
hiérarchie — pas copie littérale). Concrètement :

- **Un Design System explicite** (`DESIGN`/`COLORS`,
  `00_Constantes.gs`) : 7 niveaux typographiques documentés — H1, H2,
  Sous-titre, KPI, Libellé KPI, Tableau, Infos secondaires — chacun
  avec sa taille et sa fonction de style dédiée, appliqués strictement
  partout, sans exception. Voir `ARCHITECTURE.md` §23 pour la
  référence complète (tableau des 7 niveaux, couleurs, espacements,
  alignements).
- **Grille pleine largeur (V5)** : `WIDE_GRID_COLUMNS` (14) ×
  `WIDE_COLUMN_WIDTH` (137px) ≈ 1918px sur Dashboard et Analyse — le
  graphique de Prévisionnel s'étend sur la même largeur, son petit
  tableau mensuel restant à une largeur de lecture confortable. Voir
  `ARCHITECTURE.md` §21.
- **Dashboard, pièce maîtresse (V6, 80 % de l'effort de design)** :
  2 en-têtes H2 — "PERFORMANCE DE L'EXERCICE" au-dessus des 5 cartes
  KPI, "ÉVOLUTION" au-dessus des 2 graphiques — structurent la lecture
  en deux temps (l'état actuel, puis sa tendance), sans ajouter de
  donnée ni de calcul (moteur figé).
- **Cartes KPI et bouton Accueil sans bordure (V5.1)** : un aplat de
  couleur seul, sans contour, à la manière des "stat tiles"
  Stripe/Linear — c'est le contraste de fond qui délimite la carte,
  pas un trait. Même police, mêmes marges, même hiérarchie
  titre/valeur (`buildKpiCard_()`, seule fonction du projet qui
  construise une carte).
- **KPI = élément visuellement dominant** : la valeur d'une carte KPI
  (36pt, V6) reste la plus grande de toute l'échelle, au-dessus même
  du titre de page (22pt) — "les KPI sont l'élément principal du
  Dashboard", demande client explicite depuis la V5.2.
- **Sous-titres et en-têtes de section sur les 6 feuilles
  script-gérées** : un sous-titre "eyebrow" sous chaque titre principal
  (ex. "Chiffre d'affaires, marge et charges de l'exercice en cours")
  et, désormais distincts en taille (V6), des en-têtes H2 pour les
  sections internes (Paramètres, Dashboard) — hiérarchie titre →
  section → contexte → contenu, cohérente sur Accueil, Dashboard,
  Charges, Prévisionnel, Analyse et Paramètres (Chantiers exclue :
  feuille du client).
- **Un seul style de graphique** (`creerGraphiqueBase_()`,
  `01_Utils.gs`) : même police, mêmes couleurs d'axes/légende, même
  respiration (`chartArea`) sur les 6 graphiques du classeur ; titre de
  graphique allégé et quadrillage vertical masqué pour laisser la
  donnée dominer — les graphiques confirment une tendance, ils ne
  doivent jamais monopoliser l'attention (demande client V6).
- **Palette à 4 gris + 1 accent** : blanc, gris très clair, gris moyen,
  anthracite, et l'accent Matière & Nuance réservé aux informations
  importantes — réorganisée par rôle explicite dans le code en V6,
  aucune teinte hors de ce cadre (vérifié — voir `ARCHITECTURE.md` §16
  et §23).
- **Cellules de saisie : diviseur de ligne, pas une grille (V5.1)** :
  la bordure 4 côtés (V1-V5) est remplacée par un simple diviseur
  horizontal — élimine l'effet "tableur Excel" sur les 1000 lignes de
  Charges, sans changer le contenu ni les colonnes.
- **Coins arrondis : demandés, non réalisables** — aucune propriété de
  rayon de bordure n'existe sur une cellule Google Sheets ; documenté
  honnêtement plutôt que contourné (voir `KNOWN_LIMITATIONS.md`).

## Journal des évolutions

Voir **[`CHANGELOG.md`](CHANGELOG.md)** pour l'historique complet.
En bref : **V6.0.0** ("Design System" — refonte de l'identité
graphique, moteur de calcul définitivement figé sauf bug ; échelle
typographique à 7 niveaux formalisée [H1/H2/Sous-titre/KPI/Libellé/
Tableau/Infos secondaires], niveau H2 désormais distinct du
sous-titre de page, KPI porté à 36pt ; Dashboard devient la pièce
maîtresse avec 2 en-têtes de section structurant la lecture
[Performance/Évolution] sans nouvelle donnée ; palette reconfirmée à 4
gris + 1 accent ; direction élargie à Apple/Arc/Raycast/Linear/
Stripe/Figma ; aucune formule ni logique métier modifiée) ; **V5.2.0**
(moteur de calcul figé à la demande du client —
design uniquement désormais : KPI plus grands que le titre de page
[32pt vs 22pt], cartes plus aérées, quadrillage de graphique réduit au
strict utile, sous-titres "eyebrow" étendus à tout le classeur ;
demande de coins arrondis documentée comme non réalisable sur des
cellules Sheets plutôt que contournée ; aucune formule ni logique
métier modifiée) ; **V5.1.0** (design premium, priorité 100% UX —
cartes KPI et bouton sans bordure, cellules de saisie en diviseur de
ligne plutôt qu'en grille, titres de graphique allégés, sous-titres
"eyebrow" sur Accueil/Dashboard ; direction Notion/Linear/Stripe/Apple/
Framer ; aucune logique métier modifiée) ; **V5.0.0** (cahier des charges
client : Chantiers/Charges seuls tableaux de saisie — architecture
déjà en place, formalisée en règle ; harmonisation visuelle de
Chantiers, une première pour ce projet — couleurs/gel/largeurs/vue
filtrée, jamais de contenu touché ; design revu pour un grand écran de
bureau ~1920px ; aucune logique métier modifiée) ; **V4.1.4** (audit
systémique du séparateur de formule —
`setFormula()`/`setFormulas()` n'effectue aucune traduction
automatique de la virgule vers le point-virgule pour une locale FR,
quelle que soit la fonction ; corrige une attribution erronée à
`LET()` en V4.1.3 ; toutes les formules du projet passent désormais
par un point de construction unique, `appel_()`, avec détection de
locale automatique — même résultat de calcul) ; **V4.1.3** (correctif
initial, partiel, `LET()`) ; **V4.1.2** (correctif `chartArea.right`/`chartArea.bottom`,
clés inexistantes dans l'API Google Charts, qui faisaient échouer
l'Étape 2/3 — aucune logique métier modifiée) ; **V4.1.1** (correctif
`Range.setPadding()`, méthode inexistante dans l'API Apps Script, qui
faisait échouer l'Étape 1/3 — aucune logique métier modifiée) ;
**V4.1** (installation en 3 étapes
pour respecter la limite d'exécution de 6 minutes d'Apps Script —
corrige un dépassement constaté lors de la première installation
réelle ; aucune logique métier modifiée) ; **V4** (design premium —
système de design centralisé,
style de graphique unique, harmonisation cartes/tableaux/typographie,
menu À propos, journal technique interne, export PDF ; aucune
fonctionnalité métier, aucun calcul modifié) ; **V3** (qualité,
robustesse, sécurité, performance) ; **V2** (police Roboto, graphiques
adaptatifs, plage Charges 1000 lignes, mapping Chantiers configurable,
catégories et couleur d'accent définitives, assistant Nouvel
exercice) ; **V1** (version initiale, 7 feuilles).

Voir aussi **[`ROADMAP.md`](ROADMAP.md)** (évolutions possibles),
**[`TODO.md`](TODO.md)** (actions avant mise en production),
**[`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)** (limites Google
Sheets et risques acceptés en connaissance de cause) et
**[`RECETTE.md`](RECETTE.md)** (protocole de recette fonctionnelle —
à exécuter par une personne disposant d'un compte Google, cet
environnement de développement n'ayant aucun accès à Google Sheets).
