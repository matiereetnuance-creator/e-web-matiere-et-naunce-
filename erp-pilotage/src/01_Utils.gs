/**
 * ERP Matière & Nuance — Fonctions utilitaires réutilisables.
 *
 * Toute mise en forme, protection ou validation commune aux modules
 * passe par ces fonctions afin d'éviter la duplication de code et de
 * garder une charte graphique cohérente sur l'ensemble du classeur.
 */

/** Retourne la feuille, en la créant si elle n'existe pas encore. */
function getOrCreateSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Retourne une feuille qui DOIT déjà exister (ex. Chantiers).
 * Lève une erreur explicite sinon plutôt que d'en créer une vide.
 */
function getRequiredSheet_(name) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) {
    throw new Error('La feuille "' + name + '" est introuvable. ' +
      'Elle doit exister avant l\'installation (voir 00_Constantes.gs).');
  }
  return sheet;
}

/** Remet une feuille à plat (contenu, mise en forme, validations, protections, graphiques). */
function resetSheet_(sheet) {
  sheet.clear();
  sheet.clearNotes();
  removeAllProtections_(sheet);
  sheet.getCharts().forEach(function (chart) { sheet.removeChart(chart); });
  sheet.setHiddenGridlines(true);
  sheet.setTabColor(null);
}

function removeAllProtections_(sheet) {
  var protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  protections.forEach(function (p) {
    if (p.canEdit()) p.remove();
  });
}

/** Protège une plage calculée (avertissement à l'édition, pas de verrouillage dur). */
function protectAsCalculated_(range, description) {
  var protection = range.protect();
  protection.setDescription(description || PROTECTION_DESCRIPTION);
  protection.setWarningOnly(true);
  return protection;
}

/** Crée (ou remplace) une plage nommée. */
function setNamedRange_(name, range) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var existing = ss.getRangeByName(name);
  if (existing) ss.removeNamedRange(name);
  ss.setNamedRange(name, range);
}

/** Applique le style "titre de feuille" (grand, gras, anthracite). */
function styleTitle_(range) {
  range.setFontFamily(FONT)
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(COLORS.INK)
    .setVerticalAlignment('middle');
}

/** Style d'un libellé de carte KPI (petit, discret, majuscules). */
function styleCardLabel_(range) {
  range.setFontFamily(FONT)
    .setFontSize(9)
    .setFontWeight('bold')
    .setFontColor(COLORS.INK_MUTED)
    .setVerticalAlignment('middle');
}

/** Style de la valeur d'une carte KPI (grand, anthracite ou accent). */
function styleCardValue_(range, accent) {
  range.setFontFamily(FONT)
    .setFontSize(20)
    .setFontWeight('bold')
    .setFontColor(accent ? COLORS.ACCENT_TEXT : COLORS.INK)
    .setVerticalAlignment('middle');
}

/**
 * Construit une carte KPI simple : libellé sur la ligne `row`,
 * valeur (formule) sur la ligne `row + 1`, fond gris très clair,
 * bordure fine, valeur protégée car calculée.
 *
 * @return {Range} la cellule de valeur, pour réutilisation éventuelle.
 */
function buildKpiCard_(sheet, row, col, width, label, formula, numberFormat, accent) {
  var labelRange = sheet.getRange(row, col, 1, width);
  var valueRange = sheet.getRange(row + 1, col, 1, width);
  var cardRange = sheet.getRange(row, col, 2, width);

  labelRange.merge().setValue(label);
  styleCardLabel_(labelRange);

  valueRange.merge().setFormula(formula);
  styleCardValue_(valueRange, accent);
  if (numberFormat) valueRange.setNumberFormat(numberFormat);

  cardRange.setBackground(COLORS.CARD_BG);
  applyThinBorder_(cardRange);
  labelRange.setBackground(COLORS.CARD_BG);
  valueRange.setBackground(COLORS.CARD_BG);
  labelRange.setHorizontalAlignment('left').setPadding(0, 10, 0, 10);
  valueRange.setHorizontalAlignment('left').setPadding(0, 10, 12, 10);

  protectAsCalculated_(valueRange);

  return valueRange;
}

/** Bordure fine et unie tout autour d'une plage (charte : bordures fines, aucune ombre). */
function applyThinBorder_(range) {
  range.setBorder(true, true, true, true, false, false, COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
}

/** Marque une plage comme cellule de saisie (fond légèrement teinté, bordure accent). */
function styleInputCell_(range) {
  range.setBackground(COLORS.INPUT_BG);
  range.setBorder(true, true, true, true, false, false, COLORS.ACCENT, SpreadsheetApp.BorderStyle.SOLID);
  range.setFontFamily(FONT).setFontColor(COLORS.INK);
}

/** Style d'un en-tête de tableau de données (Charges, Prévisionnel...). */
function styleTableHeader_(range) {
  range.setFontFamily(FONT)
    .setFontSize(10)
    .setFontWeight('bold')
    .setFontColor(COLORS.WHITE)
    .setBackground(COLORS.INK)
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left');
  protectAsCalculated_(range, 'En-tête de tableau — ne pas modifier');
}

/** Applique une liste déroulante (validation) à partir d'une plage nommée. */
function setDropdownFromNamedRange_(range, namedRangeName, allowInvalid) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var source = ss.getRangeByName(namedRangeName);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(source, true)
    .setAllowInvalid(!!allowInvalid)
    .build();
  range.setDataValidation(rule);
}

/** Retourne l'index de colonne (1-based) d'un en-tête dans une feuille, ou -1. */
function findColumnByHeader_(sheet, headerRow, headerText) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return -1;
  var headers = sheet.getRange(headerRow, 1, 1, lastCol).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === headerText) return i + 1;
  }
  return -1;
}

/** Formate en euros sans décimales inutiles. */
var FORMAT_EUR = '#,##0 €;-#,##0 €';
var FORMAT_EUR_2DEC = '#,##0.00 €;-#,##0.00 €';
var FORMAT_PERCENT = '0.0%';
var FORMAT_PERCENT_TVA = '0.0%';
var FORMAT_DATE = 'dd/mm/yyyy';

/** Affiche un message de confirmation discret (bas d'écran). */
function toast_(message, title) {
  SpreadsheetApp.getActiveSpreadsheet().toast(message, title || 'Pilotage', 4);
}

/**
 * Formule (LET + SUMPRODUCT) du total d'une valeur Chantiers pour un
 * mois donné de l'exercice en cours. Utilisée par Dashboard,
 * Prévisionnel et Analyse pour éviter toute duplication de logique.
 *
 * @param {string} namedValue Plage nommée de la valeur à sommer (ex. CHANTIERS_CA_HT).
 * @param {number} monthIndex 1 (janvier) à 12 (décembre).
 * @param {string=} extraCondition Facteur SUMPRODUCT additionnel, ex. '(s="Facturé")'.
 */
function monthlyAmountFormula_(namedValue, monthIndex, extraCondition) {
  var cond = extraCondition ? '*' + extraCondition : '';
  return '=LET(d,' + NAMED_RANGES.CHANTIERS_DATE +
    ',v,' + namedValue +
    ',ex,' + NAMED_RANGES.EXERCICE +
    ',SUMPRODUCT((YEAR(d)=ex)*(MONTH(d)=' + monthIndex + ')*v' + cond + '))';
}

/** Même principe que monthlyAmountFormula_ mais sur l'exercice entier (sans filtre de mois). */
function annualAmountFormula_(namedValue, extraCondition) {
  var cond = extraCondition ? '*' + extraCondition : '';
  return '=LET(d,' + NAMED_RANGES.CHANTIERS_DATE +
    ',v,' + namedValue +
    ',ex,' + NAMED_RANGES.EXERCICE +
    ',SUMPRODUCT((YEAR(d)=ex)*v' + cond + '))';
}

/**
 * Calcule la taille (en pixels) d'un graphique à partir de la
 * géométrie réelle de son ancrage (somme des largeurs de colonnes et
 * hauteurs de lignes couvertes), plutôt qu'une valeur codée en dur.
 * Un graphique Sheets reste un objet de taille fixe une fois posé —
 * il n'existe pas de redimensionnement fluide façon page web — mais
 * cette taille s'adapte automatiquement à la mise en page réelle de
 * la feuille à chaque (ré)installation, au lieu de rester figée sur
 * un chiffre arbitraire indépendant des colonnes qu'elle survole.
 *
 * @param {Sheet} sheet
 * @param {number} colStart 1-based
 * @param {number} colSpan nombre de colonnes couvertes
 * @param {number} rowStart 1-based
 * @param {number} rowSpan nombre de lignes couvertes
 * @return {{width:number, height:number}}
 */
function computeChartSize_(sheet, colStart, colSpan, rowStart, rowSpan) {
  var width = 0;
  for (var c = colStart; c < colStart + colSpan; c++) width += sheet.getColumnWidth(c);
  var height = 0;
  for (var r = rowStart; r < rowStart + rowSpan; r++) height += sheet.getRowHeight(r);
  return { width: width, height: height };
}
