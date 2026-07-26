/**
 * ERP Matière & Nuance — Constantes globales.
 *
 * Source unique de vérité pour les noms de feuilles, la charte
 * graphique, les positions de cellules et la configuration par défaut
 * du mapping vers la feuille "Chantiers" existante (mapping ensuite
 * modifiable par le client depuis Paramètres, sans toucher au code —
 * voir CHANTIERS_FIELDS ci-dessous). Toute évolution de structure se
 * fait ICI, jamais en dupliquant des valeurs dans les modules.
 */

// ------------------------------------------------------------------
// Feuilles
// ------------------------------------------------------------------

var SHEETS = {
  ACCUEIL: '01 - Accueil',
  DASHBOARD: '02 - Dashboard',
  CHANTIERS: '03 - Chantiers',
  CHARGES: '04 - Charges',
  PARAMETRES: '05 - Paramètres',
  PREVISIONNEL: '06 - Prévisionnel',
  ANALYSE: '07 - Analyse'
};

// Ordre d'affichage des onglets dans le classeur.
var SHEET_ORDER = [
  SHEETS.ACCUEIL,
  SHEETS.DASHBOARD,
  SHEETS.CHANTIERS,
  SHEETS.CHARGES,
  SHEETS.PARAMETRES,
  SHEETS.PREVISIONNEL,
  SHEETS.ANALYSE
];

// ------------------------------------------------------------------
// Charte graphique
// Fond blanc, cartes gris très clair, texte anthracite, une seule
// couleur d'accent : le doré utilisé pour l'esperluette du logo
// Matière & Nuance (identique à --gold du site public).
// ------------------------------------------------------------------

var COLORS = {
  BACKGROUND: '#ffffff',
  CARD_BG: '#f6f5f3',
  INK: '#2b2926',       // texte anthracite
  INK_MUTED: '#8a847a', // texte secondaire / libellés
  ACCENT: '#c8b394',    // couleur de l'esperluette du logo
  ACCENT_TEXT: '#5b4f3a', // texte sur fond clair nécessitant + de contraste
  BORDER: '#e5e2dc',
  INPUT_BG: '#fbf9f5',  // fond très légèrement teinté = cellule de saisie
  WHITE: '#ffffff',

  // Mise en forme conditionnelle (V3) — toujours sobre, jamais de rouge/vert saturé.
  INACTIF_BG: '#f0efec',        // charge inactive (Actif = Non)
  OBJECTIF_ATTEINT_BG: '#f6f0e6', // écart >= 0 : accent très léger
  OBJECTIF_DEPASSE_BG: '#efe0c4', // écart nettement positif : accent un peu plus présent, jamais saturé
  OBLIGATOIRE_VIDE_BG: '#faf6ee'  // cellule obligatoire encore vide : très léger fond d'attention
};

// Palette des graphiques "par catégorie" (répartition des charges).
// Centralisée ici pour éviter de dupliquer la même liste dans
// Dashboard et Analyse (voir buildDashboardGraphiques_, buildAnalyseGraphiques_).
// Volontairement plus longue que le nombre actuel de catégories pour
// rester valide si la liste s'allonge sans qu'il faille y retoucher.
var CHART_CATEGORY_COLORS = [
  COLORS.ACCENT, COLORS.INK, COLORS.INK_MUTED,
  '#ded2ba', '#8f8577', '#d8cdb8', '#a89a7d', '#c4b8a0'
];

// 'Google Sans' n'existe pas dans le sélecteur de polices de Google
// Sheets (c'est une police d'interface produit, pas une police de
// document) : setFontFamily() l'ignore silencieusement et Sheets
// retombe sur la police par défaut du classeur. Roboto est la police
// réellement disponible dans Sheets la plus proche visuellement.
var FONT = 'Roboto';

// Hauteurs de ligne standard (V3 : centralisées pour une apparence
// uniforme sur tout le classeur — auparavant répétées en dur dans
// chaque module avec de légères variations involontaires).
var ROW_HEIGHT = {
  TITRE: 40,
  SOUS_TITRE: 26,
  SAISIE: 26,
  CARTE_LABEL: 20,
  CARTE_VALEUR: 34,
  EN_TETE_TABLEAU: 28,
  LIGNE_TABLEAU: 24
};

// ------------------------------------------------------------------
// Paramètres — emplacement des cellules de saisie et des listes
// ------------------------------------------------------------------

var PARAM_CELLS = {
  EXERCICE: 'B4',
  DATE_DEBUT: 'B5',
  DATE_FIN: 'B6',
  OBJECTIF_CA: 'B7',
  OBJECTIF_MARGE: 'B8',
  SALAIRE_MENSUEL: 'B9'
};

// Colonnes des listes techniques (masquées) dans Paramètres.
var PARAM_LISTES = {
  CATEGORIES: { col: 'H', header: 'Catégories', values: [
    'Véhicules',
    'Assurances',
    'Administration',
    'Logiciels',
    'Personnel',
    'Autres'
  ]},
  TVA: { col: 'I', header: 'TVA', values: [0, 0.055, 0.10, 0.20] },
  PERIODICITE: { col: 'J', header: 'Périodicité', values: [
    'Mensuelle', 'Trimestrielle', 'Annuelle', 'Ponctuelle'
  ]},
  OUI_NON: { col: 'K', header: 'Oui / Non', values: ['Oui', 'Non'] }
};

var PARAM_LISTES_HEADER_ROW = 2;
var PARAM_LISTES_FIRST_ROW = 3;

// Noms des plages nommées créées automatiquement (voir 10_Parametres.gs).
var NAMED_RANGES = {
  EXERCICE: 'PARAM_EXERCICE',
  DATE_DEBUT: 'PARAM_DATE_DEBUT',
  DATE_FIN: 'PARAM_DATE_FIN',
  OBJECTIF_CA: 'PARAM_OBJECTIF_CA',
  OBJECTIF_MARGE: 'PARAM_OBJECTIF_MARGE',
  SALAIRE_MENSUEL: 'PARAM_SALAIRE_MENSUEL',
  LISTE_CATEGORIES: 'LISTE_CATEGORIES',
  LISTE_TVA: 'LISTE_TVA',
  LISTE_PERIODICITE: 'LISTE_PERIODICITE',
  LISTE_OUI_NON: 'LISTE_OUI_NON',

  CHARGES_CATEGORIE: 'CHARGES_CATEGORIE',
  CHARGES_MONTANT_HT: 'CHARGES_MONTANT_HT',
  CHARGES_PERIODICITE: 'CHARGES_PERIODICITE',
  CHARGES_ACTIF: 'CHARGES_ACTIF',
  CHARGES_MENSUELLES: 'CHARGES_MENSUELLES',
  CHARGES_ANNUELLES: 'CHARGES_ANNUELLES',

  CHANTIERS_CA_HT: 'CHANTIERS_CA_HT',
  CHANTIERS_MARGE_HT: 'CHANTIERS_MARGE_HT',
  CHANTIERS_DATE: 'CHANTIERS_DATE',
  CHANTIERS_STATUT: 'CHANTIERS_STATUT',

  // Cellules de Paramètres où le CLIENT indique les en-têtes réels de
  // sa feuille Chantiers (voir bloc "Chantiers — mapping" plus bas).
  CHANTIERS_HEADER_CA_HT: 'PARAM_CHANTIERS_HEADER_CA_HT',
  CHANTIERS_HEADER_MARGE_HT: 'PARAM_CHANTIERS_HEADER_MARGE_HT',
  CHANTIERS_HEADER_DATE: 'PARAM_CHANTIERS_HEADER_DATE',
  CHANTIERS_HEADER_STATUT: 'PARAM_CHANTIERS_HEADER_STATUT',

  DASHBOARD_CA_REALISE: 'DASHBOARD_CA_REALISE',

  // Repli sûr (V3) : une cellule garantie vide, utilisée comme cible
  // d'une plage nommée CHANTIERS_* quand la colonne correspondante est
  // introuvable dans la feuille Chantiers. Sans ce filet, une formule
  // référençant une plage nommée jamais créée afficherait #NOM? dans
  // tout le classeur au lieu d'un 0 silencieux — voir ensureChantiersLinks_().
  CHANTIERS_FALLBACK: 'PARAM_CHANTIERS_FALLBACK_VIDE'
};

// Cellule technique (colonne masquée) support du repli ci-dessus.
var PARAM_FALLBACK_CELL = 'M1';

// ------------------------------------------------------------------
// Charges — mise en page
// ------------------------------------------------------------------

var CHARGES_HEADER_ROW = 7;
var CHARGES_FIRST_DATA_ROW = 8;
var CHARGES_LAST_DATA_ROW = 1000; // plage large fixe = pas de fonctions volatiles
var CHARGES_COLUMNS = [
  'Catégorie', 'Libellé', 'Fournisseur', 'Périodicité',
  'Montant HT', 'TVA', 'Date de début', 'Actif'
];

// ------------------------------------------------------------------
// Plages éditables (V3) — source unique de vérité pour
// reappliquerProtectionsFormules_() (04_Protections.gs) : toute
// cellule listée ici ne doit JAMAIS être protégée, même si elle
// contenait accidentellement une formule. Tout le reste des cellules
// à formule, sur les feuilles listées, doit l'être. La feuille
// Chantiers n'apparaît jamais ici : elle est exclue par principe de
// tout balayage de protection (jamais touchée par ce projet).
// ------------------------------------------------------------------

var EDITABLE_RANGES = {};
EDITABLE_RANGES[SHEETS.PARAMETRES] = [
  'B4:B9',   // réglages généraux de l'exercice
  'B12:B15' // mapping des en-têtes Chantiers
];
EDITABLE_RANGES[SHEETS.CHARGES] = [
  'A' + CHARGES_FIRST_DATA_ROW + ':H' + CHARGES_LAST_DATA_ROW
];

// ------------------------------------------------------------------
// Chantiers — mapping vers la feuille EXISTANTE du client
//
// ⚠️ IMPORTANT : l'onglet "03 - Chantiers" existe déjà chez le client
// et sa structure ne doit JAMAIS être modifiée par ce projet (aucune
// colonne ajoutée/supprimée, aucune formule touchée).
//
// Les en-têtes attendus ne sont PLUS codés en dur ici : ils sont
// saisis par le client dans "05 - Paramètres" (section "Connexion à
// l'onglet Chantiers", cellules B12:B15 — voir 10_Parametres.gs). Les
// `defaultHeader` ci-dessous ne servent qu'à pré-remplir ces cellules
// lors de la toute première installation ; une fois saisies, elles ne
// sont plus jamais écrasées par une réinstallation. Tout le reste du
// classeur (Dashboard, Prévisionnel, Analyse) lit Chantiers par nom
// d'en-tête (et non par position de colonne), donc corriger UNE
// cellule dans Paramètres suffit à reconnecter l'ensemble, sans
// toucher au code. Utiliser le menu Pilotage ▸ "Vérifier la structure
// Chantiers" pour contrôler la correspondance.
// ------------------------------------------------------------------

var CHANTIERS_HEADER_ROW = 1;

var CHANTIERS_FIELDS = [
  { key: 'CA_HT', row: 12, label: 'Colonne « CA HT »', defaultHeader: 'CA HT', headerNamedRange: NAMED_RANGES.CHANTIERS_HEADER_CA_HT, dataNamedRange: NAMED_RANGES.CHANTIERS_CA_HT },
  { key: 'MARGE_HT', row: 13, label: 'Colonne « Marge HT »', defaultHeader: 'Marge HT', headerNamedRange: NAMED_RANGES.CHANTIERS_HEADER_MARGE_HT, dataNamedRange: NAMED_RANGES.CHANTIERS_MARGE_HT },
  { key: 'DATE', row: 14, label: 'Colonne « Date »', defaultHeader: 'Date de facturation', headerNamedRange: NAMED_RANGES.CHANTIERS_HEADER_DATE, dataNamedRange: NAMED_RANGES.CHANTIERS_DATE },
  { key: 'STATUT', row: 15, label: 'Colonne « Statut »', defaultHeader: 'Statut', headerNamedRange: NAMED_RANGES.CHANTIERS_HEADER_STATUT, dataNamedRange: NAMED_RANGES.CHANTIERS_STATUT }
];

// ------------------------------------------------------------------
// Divers
// ------------------------------------------------------------------

var MOIS_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

var PROTECTION_DESCRIPTION = 'Cellule calculée — ne pas modifier';
