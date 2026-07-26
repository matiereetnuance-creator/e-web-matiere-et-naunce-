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
  WHITE: '#ffffff'
};

// 'Google Sans' n'existe pas dans le sélecteur de polices de Google
// Sheets (c'est une police d'interface produit, pas une police de
// document) : setFontFamily() l'ignore silencieusement et Sheets
// retombe sur la police par défaut du classeur. Roboto est la police
// réellement disponible dans Sheets la plus proche visuellement.
var FONT = 'Roboto';

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
    'Assurances',
    'Véhicules',
    'Locaux',
    'Abonnements & logiciels',
    'Salaires & charges sociales',
    'Matériel & outillage',
    'Télécom & internet',
    'Comptabilité & juridique',
    'Banque & financement',
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

  DASHBOARD_CA_REALISE: 'DASHBOARD_CA_REALISE'
};

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

var CHANTIERS_MAPPING_FIRST_ROW = 12; // Paramètres!B12:B15

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
