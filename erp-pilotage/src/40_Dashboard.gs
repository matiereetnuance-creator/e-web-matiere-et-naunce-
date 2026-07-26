/**
 * Module "02 - Dashboard"
 *
 * L'onglet principal : doit tenir sur un seul écran de 15 pouces,
 * sans défilement. 5 indicateurs clés + 2 graphiques, rien d'autre.
 */

var DASHBOARD_HELPER_COL_MOIS = 17;      // Q — données mensuelles (masquées)
var DASHBOARD_HELPER_COL_CATEGORIE = 20; // T — répartition charges (masquées)

function buildDashboard_() {
  var sheet = getOrCreateSheet_(SHEETS.DASHBOARD);
  resetSheet_(sheet);

  for (var c = 1; c <= 14; c++) sheet.setColumnWidth(c, 95);

  buildDashboardTitre_(sheet);
  buildDashboardCartes_(sheet);
  buildDashboardGraphiques_(sheet);

  sheet.setFrozenRows(1);
  sheet.hideColumns(DASHBOARD_HELPER_COL_MOIS, 6);
}

function buildDashboardTitre_(sheet) {
  var titre = sheet.getRange('A1:F1');
  titre.merge().setValue('DASHBOARD');
  styleTitle_(titre);
  sheet.setRowHeight(1, 40);
}

function buildDashboardCartes_(sheet) {
  var row = 3;
  var width = 2;
  var startCols = [1, 4, 7, 10, 13]; // A, D, G, J, M — colonne C/F/I/L = espace

  var caFormula = annualAmountFormula_(NAMED_RANGES.CHANTIERS_CA_HT);
  var caCell = buildKpiCard_(sheet, row, startCols[0], width, 'CA RÉALISÉ', caFormula, FORMAT_EUR, true);
  setNamedRange_(NAMED_RANGES.DASHBOARD_CA_REALISE, caCell);
  var caA1 = caCell.getA1Notation();

  buildKpiCard_(sheet, row, startCols[1], width, 'OBJECTIF ANNUEL', '=' + NAMED_RANGES.OBJECTIF_CA, FORMAT_EUR, false);

  var avancementFormula = '=IFERROR(' + caA1 + '/' + NAMED_RANGES.OBJECTIF_CA + ',0)';
  buildKpiCard_(sheet, row, startCols[2], width, 'AVANCEMENT', avancementFormula, FORMAT_PERCENT, false);

  buildKpiCard_(sheet, row, startCols[3], width, 'CHARGES FIXES MENSUELLES', '=' + NAMED_RANGES.CHARGES_MENSUELLES, FORMAT_EUR, false);

  var previsionFormula = '=LET(debut,' + NAMED_RANGES.DATE_DEBUT +
    ',fin,' + NAMED_RANGES.DATE_FIN +
    ',auj,TODAY()' +
    ',ecoule,MAX(MIN((auj-debut)/(fin-debut),1),1/365)' +
    ',IFERROR(' + caA1 + '/ecoule,0))';
  buildKpiCard_(sheet, row, startCols[4], width, 'PRÉVISION FIN D\'ANNÉE', previsionFormula, FORMAT_EUR, true);

  sheet.setRowHeight(row, 20);
  sheet.setRowHeight(row + 1, 34);

  return caCell;
}

function buildDashboardGraphiques_(sheet) {
  buildDashboardDonneesMensuelles_(sheet);
  buildDashboardDonneesCategories_(sheet);

  var moisRange = sheet.getRange(1, DASHBOARD_HELPER_COL_MOIS, 13, 2);
  var chartCa = sheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(moisRange)
    .setPosition(7, 1, 0, 0)
    .setOption('title', 'Évolution du CA par mois')
    .setOption('legend', { position: 'none' })
    .setOption('colors', [COLORS.ACCENT])
    .setOption('width', 520)
    .setOption('height', 280)
    .setOption('backgroundColor', COLORS.WHITE)
    .build();
  sheet.insertChart(chartCa);

  var catCount = PARAM_LISTES.CATEGORIES.values.length;
  var catRange = sheet.getRange(1, DASHBOARD_HELPER_COL_CATEGORIE, catCount + 1, 2);
  var chartCharges = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(catRange)
    .setPosition(7, 8, 0, 0)
    .setOption('title', 'Répartition des charges fixes')
    .setOption('pieHole', 0.5)
    .setOption('colors', [COLORS.ACCENT, COLORS.INK, COLORS.INK_MUTED, '#ded2ba', '#8f8577', '#d8cdb8', '#a89a7d', '#c4b8a0', '#736a5c', '#efe9dd'])
    .setOption('width', 520)
    .setOption('height', 280)
    .setOption('backgroundColor', COLORS.WHITE)
    .build();
  sheet.insertChart(chartCharges);
}

/** Table cachée Mois / CA réalisé — source du graphique d'évolution du CA. */
function buildDashboardDonneesMensuelles_(sheet) {
  var col = DASHBOARD_HELPER_COL_MOIS;
  sheet.getRange(1, col).setValue('Mois');
  sheet.getRange(1, col + 1).setValue('CA réalisé');

  var moisRange = sheet.getRange(2, col, 12, 1);
  moisRange.setValues(MOIS_LABELS.map(function (m) { return [m]; }));

  for (var i = 0; i < 12; i++) {
    var cell = sheet.getRange(2 + i, col + 1);
    cell.setFormula(monthlyAmountFormula_(NAMED_RANGES.CHANTIERS_CA_HT, i + 1));
    cell.setNumberFormat(FORMAT_EUR);
  }
  protectAsCalculated_(sheet.getRange(2, col + 1, 12, 1));
}

/** Table cachée Catégorie / Montant mensuel — source du graphique de répartition des charges. */
function buildDashboardDonneesCategories_(sheet) {
  var col = DASHBOARD_HELPER_COL_CATEGORIE;
  var categories = PARAM_LISTES.CATEGORIES.values;

  sheet.getRange(1, col).setValue('Catégorie');
  sheet.getRange(1, col + 1).setValue('Montant mensuel');

  var catRange = sheet.getRange(2, col, categories.length, 1);
  catRange.setValues(categories.map(function (c) { return [c]; }));

  for (var i = 0; i < categories.length; i++) {
    var catCell = sheet.getRange(2 + i, col).getA1Notation();
    var montantCell = sheet.getRange(2 + i, col + 1);
    montantCell.setFormula('=SUMPRODUCT((' + NAMED_RANGES.CHARGES_CATEGORIE + '=' + catCell + ')*(' +
      chargesEquivalentMensuelFormula_() + '))');
    montantCell.setNumberFormat(FORMAT_EUR);
  }
  protectAsCalculated_(sheet.getRange(2, col + 1, categories.length, 1));
}
