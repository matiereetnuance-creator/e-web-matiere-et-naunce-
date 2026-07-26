# ERP Matière & Nuance — Google Sheets / Apps Script

ERP interne (pilotage de l'activité, hors site web public) développé en
Google Apps Script : le code de ce dossier construit intégralement la
structure, la mise en forme, les formules, les validations et les
protections d'un classeur Google Sheets, sans base de données externe.

Ce module est indépendant du site web (`public/`) présent dans le
reste de ce dépôt — même client, outil différent (pilotage interne).

## Architecture

7 feuilles, dans cet ordre :

1. `01 - Accueil` — titre, exercice, bouton vers le Dashboard
2. `02 - Dashboard` — 5 KPI + 2 graphiques, tient sur un écran
3. `03 - Chantiers` — **existe déjà chez le client, jamais modifiée**
4. `04 - Charges` — base des charges fixes + 2 cartes KPI
5. `05 - Paramètres` — réglages de l'exercice + listes déroulantes
6. `06 - Prévisionnel` — vue mensuelle Objectif / Réalisé / Ecart
7. `07 - Analyse` — 3 graphiques (CA, Marge, Charges par catégorie)

```
erp-pilotage/
├── appsscript.json          Manifeste du projet Apps Script
├── ARCHITECTURE.md          Plages nommées, dépendances, flux de données, erreurs, performance
├── CHANGELOG.md             Historique détaillé V1 / V2 / V3
├── ROADMAP.md               Évolutions possibles (non développées)
├── TODO.md                  Actions restantes avant mise en production
├── KNOWN_LIMITATIONS.md     Limites Google Sheets et risques acceptés
└── src/
    ├── 00_Constantes.gs      Source unique de vérité (noms, couleurs, config par défaut du mapping Chantiers)
    ├── 01_Utils.gs           Fonctions réutilisables (cartes KPI, protections, formules, taille des graphiques)
    ├── 02_Menu.gs            Menu "Pilotage"
    ├── 03_Erreurs.gs         Bibliothèque de gestion des erreurs (V3)
    ├── 04_Protections.gs     Filet de sécurité générique sur les cellules à formule (V3)
    ├── 05_Accueil.gs
    ├── 10_Parametres.gs
    ├── 20_Charges.gs
    ├── 30_Chantiers.gs       Lecture par en-tête uniquement, aucune écriture sur la feuille existante
    ├── 40_Dashboard.gs
    ├── 50_Previsionnel.gs
    ├── 60_Analyse.gs
    ├── 85_NouvelExercice.gs  Assistant "Nouvel exercice" (nouveau fichier par année)
    ├── 90_Diagnostic.gs      Menu Pilotage ▸ Diagnostic (V3)
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
(`onOpen`). Utilisez **Pilotage ▸ Installer / Réinitialiser la
structure ERP** pour construire l'ensemble des feuilles.

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

Menu **Pilotage ▸ Installer / Réinitialiser la structure ERP**. Une
confirmation est demandée avant toute reconstruction. Les données déjà
saisies (lignes de `Charges`, contenu de `Chantiers`, réglages de
`Paramètres`) ne sont jamais effacées — seules la mise en forme, les
formules, les validations et les protections sont reconstruites.

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
  section dédiée ci-dessus et `ARCHITECTURE.md` §14.
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
| 🔄 Actualiser les listes déroulantes | Ré-applique les validations de Charges sans tout reconstruire |
| ✅ Vérifier la structure Chantiers | Contrôle le mapping B12:B15 contre la vraie feuille Chantiers |
| 🔒 Réappliquer les protections | Ré-arme le filet de sécurité (V3) sans reconstruire les feuilles |
| 🩺 Diagnostic | 7 contrôles automatiques, rapport clair (V3 — voir `ARCHITECTURE.md` §12) |
| 🆕 Nouvel exercice… | Crée une copie du classeur pour l'année suivante (voir section dédiée) |
| 🛠️ Installer / Réinitialiser | (Re)construit tout le classeur, sans jamais effacer les données saisies |

## Robustesse (V3)

Toutes les formules générées par le script sont protégées contre les
erreurs de calcul (`#REF!`, `#N/A`, `#VALUE!`, `#NOM?`) : une
dépendance cassée retombe sur une valeur neutre (0, ou un tiret)
plutôt que d'afficher une erreur, et le vrai diagnostic se fait via le
menu Diagnostic — jamais en lisant un symbole d'erreur au milieu du
classeur. Le détail (bibliothèque d'erreurs, validations de saisie,
mise en forme conditionnelle sobre, protections) est documenté dans
`ARCHITECTURE.md` §9 à §13.

## Journal des évolutions

Voir **[`CHANGELOG.md`](CHANGELOG.md)** pour l'historique complet.
En bref : **V3** (qualité, robustesse, sécurité, performance — aucune
fonctionnalité métier ajoutée, aucun calcul modifié, Dashboard non
modifié) ; **V2** (police Roboto, graphiques adaptatifs, plage Charges
1000 lignes, mapping Chantiers configurable, catégories et couleur
d'accent définitives, assistant Nouvel exercice) ; **V1** (version
initiale, 7 feuilles).

Voir aussi **[`ROADMAP.md`](ROADMAP.md)** (évolutions possibles),
**[`TODO.md`](TODO.md)** (actions avant mise en production) et
**[`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)** (limites Google
Sheets et risques acceptés en connaissance de cause).
