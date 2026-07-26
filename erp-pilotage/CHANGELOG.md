# Changelog — ERP Matière & Nuance

Toutes les versions sont des révisions du même projet Apps Script
(`erp-pilotage/`), livrées sur la branche `claude/erp-matiere-nuance-1mme8l`.

## V3 — Qualité, robustesse, sécurité, performance (actuelle)

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
