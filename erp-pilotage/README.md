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
└── src/
    ├── 00_Constantes.gs      Source unique de vérité (noms, couleurs, mapping Chantiers)
    ├── 01_Utils.gs           Fonctions réutilisables (cartes KPI, protections, formules)
    ├── 02_Menu.gs            Menu "Pilotage"
    ├── 05_Accueil.gs
    ├── 10_Parametres.gs
    ├── 20_Charges.gs
    ├── 30_Chantiers.gs       Lecture par en-tête uniquement, aucune écriture sur la feuille existante
    ├── 40_Dashboard.gs
    ├── 50_Previsionnel.gs
    ├── 60_Analyse.gs
    └── 99_Installation.gs    Orchestration de l'installation complète
```

## ⚠️ Point d'attention avant mise en production : la feuille Chantiers

Le tableau `03 - Chantiers` existe déjà dans le classeur du client et
**sa structure ne doit jamais être modifiée** (aucune colonne ajoutée,
supprimée ou renommée par ce projet). Les autres onglets lisent ses
données par **nom d'en-tête**, pas par position de colonne, via le
mapping centralisé dans `CHANTIERS_COLUMNS` (`00_Constantes.gs`) :

```js
var CHANTIERS_COLUMNS = {
  CA_HT: 'CA HT',
  MARGE_HT: 'Marge HT',
  DATE: 'Date de facturation',
  STATUT: 'Statut'
};
```

Ces intitulés sont une hypothèse de travail. **Avant toute mise en
production**, comparez-les aux véritables en-têtes de la feuille
Chantiers du client et corrigez-les si besoin — un seul endroit à
modifier, tout le reste du classeur se reconnecte automatiquement.
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

- **Couleur d'accent** : le doré `#c8b394` utilisé pour l'esperluette
  du logo Matière & Nuance sur le site public (`--gold` dans
  `public/assets/css/style.css`), repris ici comme unique couleur
  d'accent de la charte demandée.
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
