# Changelog — ERP Matière & Nuance

Toutes les versions sont des révisions du même projet Apps Script
(`erp-pilotage/`), livrées sur la branche `claude/erp-matiere-nuance-1mme8l`.

## V4.1 — Installation en 3 étapes (actuelle)

Correctif suite au **premier retour d'exécution réelle** du projet
(V4 installée sur un vrai classeur Google Sheets par le client) :
`installerERP()` dépassait la limite d'exécution Apps Script de 6
minutes ("Exceeded maximum execution time") lors de la toute première
installation sur un classeur vierge. Aucune logique métier modifiée,
aucune formule touchée — uniquement la couche d'orchestration de
l'installation et 3 optimisations de performance sans effet visible.

- **Installation découpée en 3 étapes indépendantes**
  (`installerEtape1_()` / `installerEtape2_()` / `installerEtape3_()`,
  `99_Installation.gs`) remplaçant l'unique `installerERP()` :
  Étape 1/3 (Paramètres + Charges + connexion Chantiers), Étape 2/3
  (Dashboard + Prévisionnel + Analyse), Étape 3/3 (Accueil +
  protections + rangement des onglets). Chaque étape = un clic de
  menu = une exécution Apps Script séparée, avec son propre budget de
  6 minutes. Voir ARCHITECTURE.md §4.
- **Garde-fous d'ordre** : `etapePreteEtape2_()` / `etapePreteEtape3_()`
  empêchent de lancer une étape avant la précédente (message clair au
  lieu d'un classeur à moitié construit).
- **Menu** (`02_Menu.gs`) : l'item unique "🛠️ Installer / Réinitialiser
  la structure ERP" est remplacé par un sous-menu "🛠️ Installation (en
  3 étapes)" à 3 entrées.
- **Performance** : `setColumnWidth()` appelé en boucle sur Paramètres
  (4 appels), Dashboard (14 appels) et Analyse (8 appels) remplacé par
  un seul `setColumnWidths()` chacun — même rendu, moins d'appels API,
  contribue à rester sous la limite de 6 minutes.
- **Documentation** : README.md, ARCHITECTURE.md, TODO.md,
  KNOWN_LIMITATIONS.md et RECETTE.md mis à jour pour refléter le
  nouveau flux d'installation en 3 étapes.

**Fichiers modifiés** : `99_Installation.gs` (réécrit), `02_Menu.gs`
(réécrit), `04_Protections.gs` (commentaire), `10_Parametres.gs`,
`40_Dashboard.gs`, `60_Analyse.gs` (consolidation `setColumnWidths`),
`85_NouvelExercice.gs` (message d'erreur, référence menu), `README.md`,
`ARCHITECTURE.md`, `TODO.md`, `KNOWN_LIMITATIONS.md`, `RECETTE.md`.
**Non modifiés** : tous les autres modules `build*_()` — aucune
formule, aucun calcul, aucune mise en forme changée.

## V4 — Design premium

Aucune fonctionnalité métier ajoutée, aucune formule ni logique
métier modifiée. Périmètre : transformer l'apparence et les à-côtés
non métier (version, journal, export) en logiciel professionnel.

- **Système de design centralisé** (`DESIGN`, `00_Constantes.gs`) :
  remplace `ROW_HEIGHT` (V3) et centralise en plus toutes les tailles
  de police, espacements et paddings — plus aucune valeur de mise en
  page codée en dur dans un module de feuille. Corrige au passage deux
  incohérences héritées (sous-titre "Listes techniques" à 10pt au lieu
  de 11, tableaux Charges/Prévisionnel sans hauteur de ligne fixée).
- **Titres identiques sur les 7 feuilles** : Accueil utilisait sa
  propre taille (24pt) depuis la V1, aligné sur `styleTitle_()` (20pt)
  comme les 6 autres feuilles.
- **Cartes KPI Charges rééquilibrées** : largeurs ajustées (2 puis 4
  colonnes) pour peser le même poids visuel malgré des colonnes de
  tableau très inégales en dessous (~390px contre ~380px, au lieu de
  540px contre 300px).
- **Style de graphique unique** (`creerGraphiqueBase_()`,
  `01_Utils.gs`) appliqué aux 6 graphiques du classeur (police, axes,
  grilles, légendes, respiration) — première modification de
  `40_Dashboard.gs` depuis la V2, strictement limitée à l'appel de ce
  générateur partagé (aucune formule touchée).
- **Bordures de saisie neutres** (gris) plutôt qu'accent doré — plus
  discret sur 1000 lignes de saisie.
- **Audit de palette** : toutes les couleurs du projet vérifiées comme
  appartenant à blanc / gris très clair / anthracite / accent (voir
  ARCHITECTURE.md §16).
- **`VERSION.gs`** : numéro de version, nom de build, date, auteur —
  source unique lue par le menu À propos.
- **Journal technique interne** (`06_Journal.gs`) : installation,
  diagnostic, nouvel exercice, réapplication de protections, erreurs —
  stocké dans les Document Properties (jamais visible dans une
  feuille). Menu Pilotage ▸ Afficher le journal (20 derniers
  événements).
- **Menu "À propos"** (`07_APropos.gs`) : nom du projet, version,
  build, auteur, dernier diagnostic, dernière installation.
- **Export PDF** (`95_Export.gs`) : menu Pilotage ▸ Exporter un
  rapport PDF — Dashboard, Prévisionnel, Analyse en A4, déposé sur
  Drive. Première capacité du projet nécessitant le service Drive.

**Fichiers modifiés** : `00_Constantes.gs`, `01_Utils.gs`,
`02_Menu.gs`, `05_Accueil.gs`, `10_Parametres.gs`, `20_Charges.gs`,
`40_Dashboard.gs`, `50_Previsionnel.gs`, `60_Analyse.gs`,
`85_NouvelExercice.gs`, `90_Diagnostic.gs`, `99_Installation.gs`,
`README.md`, `ARCHITECTURE.md`.
**Fichiers créés** : `VERSION.gs`, `06_Journal.gs`, `07_APropos.gs`,
`95_Export.gs`.
**Non modifiés** : `30_Chantiers.gs` (0 changement), `03_Erreurs.gs`,
`04_Protections.gs` (déjà conformes à la charte de couleurs).

## V3 — Qualité, robustesse, sécurité, performance

Aucune fonctionnalité métier ajoutée, aucun calcul modifié. Périmètre :
qualité logicielle uniquement.

- **Protection des données** : `EDITABLE_RANGES` centralise les seules
  plages qui ne doivent jamais être protégées ; `reappliquerProtectionsFormules_()`
  (`04_Protections.gs`) balaie tout le classeur (hors Chantiers) pour
  protéger toute cellule à formule oubliée par un module, de façon
  idempotente (appelable un nombre quelconque de fois sans effet de
  bord). Appelée automatiquement en fin d'installation, disponible
  aussi en menu.
- **Gestion des erreurs** (`03_Erreurs.gs`) : `avecIferror_()` protège
  désormais toutes les formules générées par le script contre
  `#REF!`/`#N/A`/`#VALUE!`/`#NOM?` ; `getSheetSafe_()` /
  `getNamedRangeSafe_()` / `getNamedValueSafe_()` évitent toute
  exception technique brute. Une colonne Chantiers introuvable
  retombe désormais sur une cellule de repli garantie vide
  (`PARAM_CHANTIERS_FALLBACK_VIDE`) plutôt que de laisser une plage
  nommée indéfinie.
- **Validation des données** : Montant HT (nombre ≥ 0), dates
  (Charges et Paramètres), Objectif CA HT / Salaire mensuel (nombre ≥
  0), Objectif Marge (0–100 %), Exercice (nombre ≥ 1900) — toutes en
  rejet strict (`setAllowInvalid(false)`).
- **Mise en forme conditionnelle** sobre (jamais de rouge/vert
  saturé) : charge inactive en gris très clair (Charges), écart
  atteint/dépassé en accent (Prévisionnel), réglage obligatoire vide
  en fond d'attention léger (Paramètres).
- **Expérience utilisateur** : notes explicatives sur les cellules
  clés (Paramètres, en-têtes Charges/Prévisionnel), hauteurs de ligne
  et formats numériques centralisés (`ROW_HEIGHT`, `00_Constantes.gs`).
- **Performances** : classeur actif mis en cache pour la durée d'une
  exécution (`getSpreadsheet_()`) ; écritures par lot (`setValues`/
  `setFormulas`/`setBackgrounds`) au lieu de boucles cellule par
  cellule sur Prévisionnel/Analyse ; lecture unique de la ligne
  d'en-tête Chantiers (au lieu d'une lecture par colonne recherchée) ;
  protections regroupées par segments de colonnes contiguës.
- **Qualité du code** : aucune fonction > 60 lignes, JSDoc sur toutes
  les fonctions publiques, suppression de code mort
  (`CHANTIERS_MAPPING_FIRST_ROW`, wrapper `findColumnByHeader_`
  redondant), palette de graphiques par catégorie centralisée
  (`CHART_CATEGORY_COLORS`) au lieu d'être dupliquée dans deux fichiers.
- **Tests** : mode Diagnostic (`90_Diagnostic.gs`, menu Pilotage ▸
  Diagnostic) — 7 contrôles automatiques (feuilles, plages nommées,
  protections, colonnes Chantiers, paramètres obligatoires,
  graphiques, listes), rapport clair dans une boîte de dialogue.
- **Documentation** : `ARCHITECTURE.md` complété (gestion des erreurs,
  validation, mise en forme conditionnelle, diagnostic, performance) ;
  ajout de `CHANGELOG.md`, `ROADMAP.md`, `TODO.md`,
  `KNOWN_LIMITATIONS.md` (ce fichier et ses voisins).

**Fichiers modifiés** : `00_Constantes.gs`, `01_Utils.gs`,
`02_Menu.gs`, `05_Accueil.gs`, `10_Parametres.gs`, `20_Charges.gs`,
`30_Chantiers.gs`, `50_Previsionnel.gs`, `60_Analyse.gs`,
`85_NouvelExercice.gs`, `99_Installation.gs`, `README.md`,
`ARCHITECTURE.md`.
**Fichiers créés** : `03_Erreurs.gs`, `04_Protections.gs`,
`90_Diagnostic.gs`, `CHANGELOG.md`, `ROADMAP.md`, `TODO.md`,
`KNOWN_LIMITATIONS.md`.
**Fichiers explicitement non modifiés** (consigne du client) :
`40_Dashboard.gs` (0 ligne changée). `30_Chantiers.gs` a été modifié
mais uniquement pour des raisons de robustesse/performance (lecture
groupée des en-têtes, repli d'erreur) — la détection des colonnes et
son résultat sont identiques ; seul le texte du message d'erreur en
cas de colonne manquante s'est légèrement enrichi.

## V2 — Architecture

- Police `Google Sans` (invalide dans Google Sheets) remplacée par
  `Roboto`.
- Taille des graphiques calculée depuis la géométrie réelle de leur
  ancrage (`computeChartSize_()`) au lieu de pixels codés en dur.
- Plage de saisie Charges étendue de 500 à 1000 lignes.
- Mapping des en-têtes Chantiers déplacé d'une constante de code vers
  des cellules éditables dans Paramètres (B12:B15) — corrigeable par
  le client sans redéploiement.
- Catégories de charges définitives (décision validée avec le
  client) : Véhicules, Assurances, Administration, Logiciels,
  Personnel, Autres.
- Couleur d'accent (`#c8b394`) confirmée définitive par le client.
- Ajout de l'assistant "Nouvel exercice" (menu Pilotage) : crée une
  copie complète du classeur pour l'année suivante, sans jamais
  modifier le fichier actuel.
- Ajout d'`ARCHITECTURE.md`.

## V1 — Version initiale

- 7 feuilles : Accueil, Dashboard, Chantiers (lecture seule),
  Charges, Paramètres, Prévisionnel, Analyse.
- Listes déroulantes générées depuis Paramètres, cellules calculées
  protégées, graphiques natifs Sheets, menu "Pilotage", installation
  idempotente préservant les données déjà saisies.
- La feuille Chantiers existante n'est jamais modifiée : lue par nom
  d'en-tête via un mapping centralisé.
