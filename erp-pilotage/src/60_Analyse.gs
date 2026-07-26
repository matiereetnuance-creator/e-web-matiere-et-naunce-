/**
 * Module "07 - Analyse"
 *
 * Exactement trois graphiques, aucun autre indicateur : CA par mois,
 * Marge par mois, Charges par catégorie. Les deux premiers sont
 * calculés ici (table cachée) ; le troisième réutilise directement la
 * répartition des charges déjà calculée sur le Dashboard, pour éviter
 * de dupliquer le même calcul deux fois dans le classeur.
 */

var ANALYSE_HELPER_COL = 10; // J — données mensuelles (masquées)

function buildAnalyse_() {
  var sheet = getOrCreateSheet_(SHEETS.ANALYSE);
  resetSheet_(sheet);

  for (var c = 1; c <= 8; c++) sheet.setColumnWidth(c, 95);

  buildAnalyseTitre_(sheet);
  buildAnalyseDonneesMensuelles_(sheet);
  buildAnalyseGraphiques_(sheet);

  sheet.hideColumns(ANALYSE_HELPER_COL, 3);
}

function buildAnalyseTitre_(sheet) {
  var titre = sheet.getRange('A1:F1');
  titre.merge().setValue('ANALYSE');
  styleTitle_(titre);
  sheet.setRowHeight(1, 40);
}

/** Table cachée Mois / CA / Marge — source des deux premiers graphiques. */
function buildAnalyseDonneesMensuelles_(sheet) {
  var col = ANALYSE_HELPER_COL;
  sheet.getRange(1, col).setValue('Mois');
  sheet.getRange(1, col + 1).setValue('CA');
  sheet.getRange(1, col + 2).setValue('Marge');

  var moisRange = sheet.getRange(2, col, 12, 1);
  moisRange.setValues(MOIS_LABELS.map(function (m) { return [m]; }));

  for (var i = 0; i < 12; i++) {
    var row = 2 + i;
    var caCell = sheet.getRange(row, col + 1);
    caCell.setFormula(monthlyAmountFormula_(NAMED_RANGES.CHANTIERS_CA_HT, i + 1));
    caCell.setNumberFormat(FORMAT_EUR);

    var margeCell = sheet.getRange(row, col + 2);
    margeCell.setFormula(monthlyAmountFormula_(NAMED_RANGES.CHANTIERS_MARGE_HT, i + 1));
    margeCell.setNumberFormat(FORMAT_EUR);
  }
  protectAsCalculated_(sheet.getRange(2, col + 1, 12, 2));
}

var ANALYSE_CHART_ROWSPAN = 13;
var ANALYSE_CHART_COLSPAN = 7;
var ANALYSE_CHART_CATEGORIES_ROW = 20;

function buildAnalyseGraphiques_(sheet) {
  var col = ANALYSE_HELPER_COL;

  var tailleCa = computeChartSize_(sheet, 1, ANALYSE_CHART_COLSPAN, 3, ANALYSE_CHART_ROWSPAN);
  var chartCa = sheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(sheet.getRange(1, col, 13, 2)) // Mois, CA
    .setPosition(3, 1, 0, 0)
    .setOption('title', 'CA par mois')
    .setOption('legend', { position: 'none' })
    .setOption('colors', [COLORS.ACCENT])
    .setOption('width', tailleCa.width)
    .setOption('height', tailleCa.height)
    .setOption('backgroundColor', COLORS.WHITE)
    .build();
  sheet.insertChart(chartCa);

  var colStartMarge = 1 + ANALYSE_CHART_COLSPAN;
  var tailleMarge = computeChartSize_(sheet, colStartMarge, ANALYSE_CHART_COLSPAN, 3, ANALYSE_CHART_ROWSPAN);
  var chartMarge = sheet.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(sheet.getRange(1, col, 13, 1))     // Mois
    .addRange(sheet.getRange(1, col + 2, 13, 1)) // Marge
    .setPosition(3, colStartMarge, 0, 0)
    .setOption('title', 'Marge par mois')
    .setOption('legend', { position: 'none' })
    .setOption('colors', [COLORS.INK])
    .setOption('width', tailleMarge.width)
    .setOption('height', tailleMarge.height)
    .setOption('backgroundColor', COLORS.WHITE)
    .build();
  sheet.insertChart(chartMarge);

  var dashboard = getRequiredSheet_(SHEETS.DASHBOARD);
  var catCount = PARAM_LISTES.CATEGORIES.values.length;
  var catRange = dashboard.getRange(1, DASHBOARD_HELPER_COL_CATEGORIE, catCount + 1, 2);
  var tailleCharges = computeChartSize_(sheet, 1, ANALYSE_CHART_COLSPAN, ANALYSE_CHART_CATEGORIES_ROW, ANALYSE_CHART_ROWSPAN);
  var chartCharges = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(catRange)
    .setPosition(ANALYSE_CHART_CATEGORIES_ROW, 1, 0, 0)
    .setOption('title', 'Charges par catégorie')
    .setOption('pieHole', 0.5)
    .setOption('colors', [COLORS.ACCENT, COLORS.INK, COLORS.INK_MUTED, '#ded2ba', '#8f8577', '#d8cdb8', '#a89a7d', '#c4b8a0', '#736a5c', '#efe9dd'])
    .setOption('width', tailleCharges.width)
    .setOption('height', tailleCharges.height)
    .setOption('backgroundColor', COLORS.WHITE)
    .build();
  sheet.insertChart(chartCharges);
}
