# Changelog — ERP Matière & Nuance

Toutes les versions sont des révisions du même projet Apps Script
(`erp-pilotage/`), livrées sur la branche `claude/erp-matiere-nuance-1mme8l`.

## V4.1.3 — Correctif `LET()` (`#ERROR!`/`#VALUE!` en locale FR, actuelle)

Correctif suite au **quatrième retour d'exécution réelle** du projet :
installation V4.1.2 terminée avec succès, mais de nombreuses cellules
affichaient `#ERROR!`/`#VALUE!` (Dashboard, Charges, Prévisionnel,
Analyse) sur ce classeur en locale Google Sheets FR (séparateur
d'arguments `;`, décimale `,`).

**Cellules et formules concernées** (identifiées par lecture directe
du code, pas par supposition) :

| Feuille | Cellule(s) | Généré par | Utilisait `LET()` |
|---|---|---|---|
| Dashboard | A4:B4 (`CA RÉALISÉ`, = `DASHBOARD_CA_REALISE`) | `annualAmountFormula_()` | Oui |
| Dashboard | M4:N4 (`PRÉVISION FIN D'ANNÉE`) | `previsionFormula` (`buildDashboardCartes_`) | Oui |
| Dashboard | Q2:R13 (table cachée CA mensuel) | `monthlyAmountFormula_()` | Oui |
| Dashboard | J4:K4 (`AVANCEMENT`) et J10:K10 (`CHARGES FIXES MENSUELLES`) | référencent les cellules ci-dessus | Non, mais en cascade |
| Charges | A4:B4 (`CHARGES MENSUELLES`, = `CHARGES_MENSUELLES`) | `mensuelFormula` (`buildChargesCartes_`) | Oui |
| Charges | E4:H4 (`CHARGES ANNUELLES`) | référence la cellule ci-dessus (`×12`) | Non, mais en cascade |
| Prévisionnel | C4:C15 (`Réalisé`, 12 mois) | `monthlyAmountFormula_()` | Oui |
| Prévisionnel | D4:D15 (`Ecart`) et ligne Total (C16, D16) | référencent la colonne C ci-dessus | Non, mais en cascade |
| Analyse | K2:K13 / L2:L13 (table cachée CA/Marge mensuels) | `monthlyAmountFormula_()` | Oui |

**Cause identifiée** : `LET()` est la seule fonction du projet dont la
liste nom/valeur (séparée par des virgules, ex.
`LET(d,...,v,...,ex,...,SUMPRODUCT(...))`) n'est pas retraduite de
façon fiable par Google Sheets pour les locales dont le séparateur
d'arguments natif est `;` (dont le français), lorsque la formule est
écrite programmatiquement via `Range.setFormula()`/`setFormulas()`.
Les fonctions historiques utilisées partout ailleurs dans le projet
(`SUMPRODUCT`, `IFERROR`, `IF`, `IFS`, `YEAR`, `MONTH`, `SUM`, `MAX`,
`MIN`, `TODAY`) sont, elles, traduites de façon fiable depuis de
nombreuses années — c'est pourquoi seules les cellules construites via
`LET()` sont touchées, jamais les autres. Confirmé par la
correspondance exacte entre les cellules en erreur et l'usage de
`LET()` dans le code (4 générateurs de formule au total, tous
recensés ci-dessus).

- **`monthlyAmountFormula_()` / `annualAmountFormula_()`**
  (`01_Utils.gs`) : `LET()` supprimé, les plages nommées sont
  réinjectées directement dans `SUMPRODUCT(...)` (elles étaient déjà
  la seule abstraction nécessaire — `LET` ne faisait qu'un alias de
  lisibilité). Résultat de calcul rigoureusement identique.
- **Dashboard, carte "PRÉVISION FIN D'ANNÉE"** (`40_Dashboard.gs`) :
  `LET()` supprimé, `debut`/`fin`/`auj`/`ecoule` réinjectés en ligne
  dans la formule `IFERROR(.../MAX(MIN(...),1),1/365),0)`.
- **Charges, carte "CHARGES MENSUELLES"** (`20_Charges.gs`) :
  `LET(mensuel,...,SUM(mensuel))` remplacé par `SUMPRODUCT(...)` —
  déjà le motif utilisé ailleurs dans le projet (Dashboard) pour
  sommer ce même calcul ; supprime `LET()` et clarifie l'évaluation en
  tableau (élimine aussi toute ambiguïté sur le caractère "tableau" du
  résultat de `IF`/`IFS` en dehors de `SUMPRODUCT`).
- **Durcissement complémentaire** (`50_Previsionnel.gs`) : le seul
  littéral décimal restant dans une formule du projet (`*0.1`, règle
  de mise en forme conditionnelle "objectif dépassé") remplacé par
  `*(1/10)` — n'était pas la cause des `#ERROR!`/`#VALUE!` rapportés
  (une règle de mise en forme conditionnelle ne peut jamais afficher de
  texte d'erreur, seulement un fond de couleur), mais élimine par
  précaution la dernière construction sensible à la locale du projet.

**Non expliqué par ce correctif** : les 2 formules d'Accueil
(`B3` = `IFERROR(PARAM_EXERCICE,"—")`, bouton `HYPERLINK(...)`)
n'utilisent ni `LET()` ni aucune autre construction identifiée comme
à risque — si des erreurs y persistent après ce correctif, il ne
s'agit pas de la même cause et la cellule exacte devra être précisée
pour investigation.

**Fichiers modifiés** : `01_Utils.gs`, `40_Dashboard.gs`,
`20_Charges.gs`, `50_Previsionnel.gs`, `ARCHITECTURE.md`,
`KNOWN_LIMITATIONS.md`.
**Non modifiés** : `60_Analyse.gs`, `85_NouvelExercice.gs` (consomment
`monthlyAmountFormula_()`/`annualAmountFormula_()` sans les
redéfinir) ; aucune valeur ni logique métier changée — même résultat
de calcul dans tous les cas, uniquement la syntaxe de formule.

## V4.1.2 — Correctif `chartArea.right`/`chartArea.bottom`

Correctif suite au **troisième retour d'exécution réelle** du projet :
l'Étape 2/3 de l'installation échouait avec "L'option graphique n'est
plus compatible : chartArea.bottom". `creerGraphiqueBase_()`
(`01_Utils.gs`), le point de style commun aux 6 graphiques du classeur,
définissait `chartArea: { left, top, right, bottom }` — or l'objet
`chartArea` de l'API Google Charts (utilisée par
`SpreadsheetApp.newChart()`) n'accepte que `backgroundColor`, `left`,
`top`, `width` et `height` ; `right` et `bottom` ne sont pas des clés
valides, quelle que soit la version de l'API.

- **Toutes les options de graphique du projet ont été revérifiées**
  contre l'API Google Charts réelle (`fontName`, `backgroundColor`,
  `titleTextStyle`, `hAxis`/`vAxis` — `textStyle`/`gridlines`/
  `baselineColor`, `legend` — `textStyle`/`position`, `pieHole`,
  `colors`, `width`/`height`, `title`) : toutes valides, seule
  `chartArea.right`/`chartArea.bottom` posait problème.
- **Remplacement** : `chartArea: { left: 12, top: 34, width: '85%',
  height: '68%' }` — `width`/`height` en pourcentage définissent la
  marge droite/basse en creux (100 % moins la zone de tracé), de façon
  proportionnelle à la taille réelle de chaque graphique (qui varie
  selon son ancrage, voir `computeChartSize_()`), sans dépendre d'une
  clé qui n'existe pas dans l'API.
- Répercuté automatiquement sur les 6 graphiques du classeur (Dashboard
  ×2, Prévisionnel ×1, Analyse ×3), tous construits via ce point de
  style commun — aucun des 4 fichiers qui appellent
  `creerGraphiqueBase_()` (`40_Dashboard.gs`, `50_Previsionnel.gs`,
  `60_Analyse.gs`) n'a eu besoin d'être modifié.

**Fichiers modifiés** : `01_Utils.gs` (`chartArea`),
`ARCHITECTURE.md` §15, `KNOWN_LIMITATIONS.md`.
**Non modifiés** : `40_Dashboard.gs`, `50_Previsionnel.gs`,
`60_Analyse.gs` (consomment `creerGraphiqueBase_()` sans redéfinir
`chartArea`), aucune formule, aucune logique métier.

## V4.1.1 — Correctif `Range.setPadding()`

Correctif suite au **deuxième retour d'exécution réelle** du projet :
l'Étape 1/3 de l'installation V4.1 échouait avec `labelRange.set
HorizontalAlignment(...).setPadding is not a function`.
`Range.setPadding()` n'existe pas dans l'API `SpreadsheetApp`
(`Range`) — une méthode inventée par erreur dans `buildKpiCard_()`
(`01_Utils.gs`), jamais vérifiée contre l'API réelle avant ce retour
d'exécution. Aucune alternative fidèle n'existe dans l'API de base
(la marge interne d'une cellule Sheets n'est pas pilotable depuis
`SpreadsheetApp` ; seule l'API Sheets avancée l'expose, ce qui
demanderait d'activer un service avancé pour un espacement de
quelques pixels — jugé hors de proportion). Les deux appels
`.setPadding(...)` ont donc été supprimés, ainsi que les 4 constantes
`DESIGN.CARD_PADDING_LEFT/RIGHT/TOP/BOTTOM` (`00_Constantes.gs`)
devenues orphelines. Impact visuel : négligeable — l'alignement à
gauche (`setHorizontalAlignment('left')`) est conservé, et l'espace
entre bordure de carte et texte reste celui, par défaut, du rendu
Google Sheets.

**Fichiers modifiés** : `01_Utils.gs` (suppression des 2 appels
`setPadding`), `00_Constantes.gs` (suppression des 4 constantes
`CARD_PADDING_*` devenues orphelines), `ARCHITECTURE.md` §14,
`KNOWN_LIMITATIONS.md`.
**Non modifiés** : aucune autre fonction de `buildKpiCard_()`, aucune
formule, aucune logique métier.

## V4.1 — Installation en 3 étapes

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
