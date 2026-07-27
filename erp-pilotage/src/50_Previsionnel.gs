/**
 * Module "06 - Prévisionnel"
 *
 * Vue mensuelle Objectif / Réalisé / Ecart, de janvier à décembre,
 * suivie d'un unique graphique annuel. L'objectif mensuel est
 * l'objectif annuel réparti à parts égales (solution la plus simple
 * et la plus robuste, aucun paramètre de saisonnalité n'étant demandé).
 */

var PREVISIONNEL_HEADER_ROW = 4;
var PREVISIONNEL_FIRST_ROW = 5; // Janvier
var PREVISIONNEL_TABLE_COLUMNS = 4; // Mois, Objectif, Réalisé, Ecart
var PREVISIONNEL_CHART_ROWSPAN = 16;

/**
 * Construit entièrement la feuille Prévisionnel (100% générée, aucune
 * donnée de saisie). V5 : le tableau (4 colonnes) garde une largeur de
 * lecture confortable ; le graphique en dessous, lui, s'étend sur
 * toute la grille pleine largeur (DESIGN.WIDE_GRID_COLUMNS, colonnes
 * E:N ajoutées uniquement comme largeur de cadrage pour le graphique,
 * jamais de contenu) — c'est le graphique, pas le petit tableau
 * mensuel, qui doit occuper "toute la largeur de l'écran".
 */
function buildPrevisionnel_() {
  var sheet = getOrCreateSheet_(SHEETS.PREVISIONNEL);
  resetSheet_(sheet);

  var largeursTable = [180, 170, 170, 170]; // Mois, Objectif, Réalisé, Ecart
  largeursTable.forEach(function (largeur, i) { sheet.setColumnWidth(i + 1, largeur); });

  var largeurTableTotale = largeursTable.reduce(function (a, b) { return a + b; }, 0);
  var colonnesCadrage = DESIGN.WIDE_GRID_COLUMNS - PREVISIONNEL_TABLE_COLUMNS;
  if (colonnesCadrage > 0) {
    var largeurCadrage = Math.round((DESIGN.WIDE_GRID_COLUMNS * DESIGN.WIDE_COLUMN_WIDTH - largeurTableTotale) / colonnesCadrage);
    sheet.setColumnWidths(PREVISIONNEL_TABLE_COLUMNS + 1, colonnesCadrage, largeurCadrage);
  }

  buildPrevisionnelTitre_(sheet);
  buildPrevisionnelSousTitre_(sheet);
  buildPrevisionnelEnTete_(sheet);
  buildPrevisionnelLignesMois_(sheet);
  buildPrevisionnelLigneTotal_(sheet);
  buildPrevisionnelMiseEnFormeConditionnelle_(sheet);
  buildPrevisionnelGraphique_(sheet);

  sheet.setFrozenRows(PREVISIONNEL_HEADER_ROW);
}

function buildPrevisionnelTitre_(sheet) {
  var titre = sheet.getRange('A1:D1');
  titre.merge().setValue('PRÉVISIONNEL');
  styleTitle_(titre);
  sheet.setRowHeight(1, DESIGN.HEADER_HEIGHT);
}

/** Légende discrète sous le titre (V5.2) — cohérence avec Accueil/Dashboard/Charges. */
function buildPrevisionnelSousTitre_(sheet) {
  var sousTitre = sheet.getRange('A2:D2');
  sousTitre.merge().setValue('Objectif mensuel comparé au chiffre d\'affaires réalisé');
  stylePageSubtitle_(sousTitre);
  sheet.setRowHeight(2, DESIGN.SUBHEADER_HEIGHT);
}

function buildPrevisionnelEnTete_(sheet) {
  var header = sheet.getRange(PREVISIONNEL_HEADER_ROW, 1, 1, 4);
  header.setValues([['Mois', 'Objectif', 'Réalisé', 'Ecart']]);
  styleTableHeader_(header);
  sheet.setRowHeight(PREVISIONNEL_HEADER_ROW, DESIGN.TABLE_HEADER_HEIGHT);
  sheet.getRange(PREVISIONNEL_HEADER_ROW, 2).setNote(
    'Objectif CA HT annuel (Paramètres) réparti à parts égales sur 12 mois.');
  sheet.getRange(PREVISIONNEL_HEADER_ROW, 4).setNote(
    'Réalisé − Objectif. Positif = objectif atteint ou dépassé (fond doré) ; ' +
    'négatif = en dessous de l\'objectif (aucune couleur d\'alerte).');
}

/**
 * Écrit les 12 lignes mensuelles en une seule fois par colonne
 * (setValues/setFormulas/setNumberFormat/setBackgrounds/protection
 * plutôt que 12 appels séparés par colonne — V3, audit performance).
 * Les valeurs sont calculées en JavaScript (aucun appel au classeur)
 * puis écrites en un seul aller-retour par plage.
 */
function buildPrevisionnelLignesMois_(sheet) {
  var n = 12;
  var moisValues = [];
  var objectifFormulas = [];
  var realiseFormulas = [];
  var ecartFormulas = [];
  var fonds = [];

  for (var m = 1; m <= n; m++) {
    moisValues.push([MOIS_LABELS[m - 1]]);
    var row = PREVISIONNEL_FIRST_ROW + m - 1;
    objectifFormulas.push([avecIferror_(NAMED_RANGES.OBJECTIF_CA + '/12', 0)]);
    realiseFormulas.push([monthlyAmountFormula_(NAMED_RANGES.CHANTIERS_CA_HT, m)]);
    ecartFormulas.push([avecIferror_('C' + row + '-B' + row, 0)]);
    fonds.push([m % 2 === 0 ? COLORS.CARD_BG : COLORS.WHITE]);
  }

  var moisRange = sheet.getRange(PREVISIONNEL_FIRST_ROW, 1, n, 1);
  moisRange.setValues(moisValues);

  sheet.getRange(PREVISIONNEL_FIRST_ROW, 2, n, 1).setFormulas(objectifFormulas);
  sheet.getRange(PREVISIONNEL_FIRST_ROW, 3, n, 1).setFormulas(realiseFormulas);
  sheet.getRange(PREVISIONNEL_FIRST_ROW, 4, n, 1).setFormulas(ecartFormulas);

  var toutesLesLignes = sheet.getRange(PREVISIONNEL_FIRST_ROW, 1, n, 4);
  toutesLesLignes.setFontFamily(FONT).setFontSize(DESIGN.TABLE_BODY_FONT_SIZE).setFontColor(COLORS.INK);
  sheet.getRange(PREVISIONNEL_FIRST_ROW, 2, n, 3).setNumberFormat(FORMAT_EUR);
  sheet.setRowHeights(PREVISIONNEL_FIRST_ROW, n, DESIGN.TABLE_ROW_HEIGHT);

  toutesLesLignes.setBackgrounds(fonds.map(function (f) { return [f[0], f[0], f[0], f[0]]; }));

  protectAsCalculated_(moisRange);
  protectAsCalculated_(sheet.getRange(PREVISIONNEL_FIRST_ROW, 2, n, 3));
}

function buildPrevisionnelLigneTotal_(sheet) {
  var totalRow = PREVISIONNEL_FIRST_ROW + 12;
  var totalRange = sheet.getRange(totalRow, 1, 1, 4);
  totalRange.setFontFamily(FONT).setFontSize(DESIGN.TABLE_BODY_FONT_SIZE).setFontWeight('bold').setFontColor(COLORS.INK);
  sheet.setRowHeight(totalRow, DESIGN.TABLE_ROW_HEIGHT);

  sheet.getRange(totalRow, 1).setValue('Total');

  ['B', 'C', 'D'].forEach(function (col) {
    var cell = sheet.getRange(col + totalRow);
    cell.setFormula(avecIferror_('SUM(' + col + PREVISIONNEL_FIRST_ROW + ':' + col + (totalRow - 1) + ')', 0));
    cell.setNumberFormat(FORMAT_EUR);
  });

  totalRange.setBorder(true, false, false, false, false, false, COLORS.INK, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  protectAsCalculated_(totalRange);
}

/**
 * Mise en forme conditionnelle sobre (V3) sur la colonne Ecart :
 * objectif dépassé (nettement positif) en accent un peu plus présent,
 * objectif atteint (positif) en accent très léger. Jamais de rouge
 * pour un écart négatif — signal neutre, pas alarmant.
 */
function buildPrevisionnelMiseEnFormeConditionnelle_(sheet) {
  var totalRow = PREVISIONNEL_FIRST_ROW + 12;
  var plageEcart = sheet.getRange(PREVISIONNEL_FIRST_ROW, 4, totalRow - PREVISIONNEL_FIRST_ROW, 1);
  var premiereLigne = PREVISIONNEL_FIRST_ROW;

  var regleDepasse = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D' + premiereLigne + '>$B' + premiereLigne + '*(1/10)')
    .setBackground(COLORS.OBJECTIF_DEPASSE_BG)
    .setRanges([plageEcart])
    .build();
  var regleAtteint = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$D' + premiereLigne + '>=0')
    .setBackground(COLORS.OBJECTIF_ATTEINT_BG)
    .setRanges([plageEcart])
    .build();

  // Ordre important : Sheets applique la première règle qui correspond.
  sheet.setConditionalFormatRules([regleDepasse, regleAtteint]);
}

function buildPrevisionnelGraphique_(sheet) {
  var totalRow = PREVISIONNEL_FIRST_ROW + 12;
  var dataRange = sheet.getRange(PREVISIONNEL_HEADER_ROW, 1, totalRow - PREVISIONNEL_HEADER_ROW, 3); // Mois, Objectif, Réalisé
  var chartRow = totalRow + 2;
  var taille = computeChartSize_(sheet, 1, DESIGN.WIDE_GRID_COLUMNS, chartRow, PREVISIONNEL_CHART_ROWSPAN);

  var chart = creerGraphiqueBase_(sheet, Charts.ChartType.COLUMN)
    .addRange(dataRange)
    .setPosition(chartRow, 1, 0, 0)
    .setOption('title', 'Objectif vs Réalisé par mois')
    .setOption('colors', [COLORS.INK_MUTED, COLORS.ACCENT])
    .setOption('legend', { position: 'top', textStyle: { color: COLORS.INK_MUTED, fontSize: DESIGN.NOTE_FONT_SIZE } })
    .setOption('width', taille.width)
    .setOption('height', taille.height)
    .build();
  sheet.insertChart(chart);
}
